import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { execSync } from "child_process";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route for GitHub Audit
  app.post("/api/audit", async (req, res) => {
    try {
      const { repoUrl, model } = req.body;
      
      if (!repoUrl || !model) {
        return res.status(400).json({ error: "Missing repoUrl or model" });
      }

      const geminiApiKey = process.env.GEMINI_API_KEY;

      if (!geminiApiKey) {
        return res.status(500).json({ error: "Veuillez configurer GEMINI_API_KEY dans les variables d'environnement." });
      }

      // 1. Parse GitHub URL
      let owner = "", repo = "";
      try {
        const urlObj = new URL(repoUrl);
        const parts = urlObj.pathname.split("/").filter(Boolean);
        if (urlObj.hostname !== "github.com" || parts.length < 2) {
          throw new Error("Invalid GitHub URL");
        }
        owner = parts[0];
        repo = parts[1];
      } catch (err) {
        return res.status(400).json({ error: "Please enter a valid GitHub repository URL (e.g., https://github.com/facebook/react)" });
      }

      // 2. Fetch Repo Details from GitHub
      const headers = { 
        "User-Agent": "AuditSaaS-App",
        "Accept": "application/vnd.github.v3+json"
      };

      let repoData: any = { full_name: `${owner}/${repo}`, description: "Non spécifié", stargazers_count: "?", forks_count: "?", language: "Inconnu", open_issues_count: "?" };
      try {
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (repoRes.ok) {
          repoData = await repoRes.json();
        } else {
          console.warn("GitHub API rate limit or not found, proceeding with default info");
        }
      } catch (e) {}

      let readmeContent = "Aucun README trouvé.";
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
        if (readmeRes.ok) {
          const readmeJson = await readmeRes.json();
          readmeContent = Buffer.from(readmeJson.content, 'base64').toString('utf-8');
        }
      } catch (e) {
        console.warn("Could not fetch readme", e);
      }

      // Fetch codebase summary using repomix
      let codebaseMd = "Codebase non récupérée.";
      try {
        const outputFilename = `repomix-${Date.now()}-${Math.floor(Math.random() * 1000)}.md`;
        
        // Exclude common bloated directories to keep the packed file lean
        const ignorePatterns = "node_modules,dist,build,public,assets,docs,test,tests,coverage,vendor,*.min.js,*.lock,package-lock.json,yarn.lock,pnpm-lock.yaml";
        
        console.log(`Running repomix for ${owner}/${repo}...`);
        execSync(`npx repomix --remote ${owner}/${repo} --style markdown --output ${outputFilename} --ignore "${ignorePatterns}"`, { stdio: 'pipe' });
        
        if (fs.existsSync(outputFilename)) {
          codebaseMd = fs.readFileSync(outputFilename, 'utf-8');
          fs.unlinkSync(outputFilename);
        }
      } catch (e: any) {
        console.warn("Could not fetch codebase via repomix", e.message);
        codebaseMd = "Failed to fetch full codebase. " + e.message;
      }

      // 3. Prepare OpenRouter LLM Call
      const systemPrompt = `Tu es un Senior Software Engineer spécialisé en SaaS, architecture, et IA. Ton objectif est d'auditer un dépôt GitHub basé sur ses métadonnées, son README, et l'extrait du code.
Tu DOIS répondre UNIQUEMENT avec un objet JSON pur respectant cette structure, obligatoirement en FRANÇAIS :
{
  "score": number (0-100),
  "summary": "string (Verdict global concis)",
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "security": { "score": number, "notes": "string (notes détaillées)" },
  "architecture": { "score": number, "notes": "string (notes détaillées)" },
  "recommendations": ["string", "string"]
}
Ne pas inclure de balises markdown (comme \`\`\`json) ou de texte supplémentaire en dehors du JSON. Les textes doivent être en français.`;

      const userPrompt = `Veuillez analyser le dépôt suivant :
Nom: ${repoData.full_name}
Description: ${repoData.description || 'Aucune'}
Étoiles: ${repoData.stargazers_count}
Forks: ${repoData.forks_count}
Langage: ${repoData.language}
Issues ouvertes: ${repoData.open_issues_count}

Extrait du README (4000 premiers caractères) :
${readmeContent.substring(0, 4000)}

Extrait du Code :
${codebaseMd.substring(0, 80000)}
`;

      let rawContent = "";
      
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        // Assuming model is "gemini-2.5-flash" or "gemini-2.5-pro"
        const finalModel = model.startsWith("gemini") ? model : "gemini-2.5-flash";
        
        const response = await ai.models.generateContent({
           model: finalModel,
           contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }]
        });
        rawContent = response.text || "";
      } catch (e) {
        console.error("Gemini Error caught:", e);
        return res.status(500).json({ error: "Erreur de communication avec l'API Gemini. Réessayez plus tard." });
      }
      
      // Clean up potential markdown fences if the model ignored instructions
      const cleanJsonStr = rawContent.replace(/^```json/m, '').replace(/^```/m, '').replace(/```$/m, '').trim();

      let auditResult;
      try {
        auditResult = JSON.parse(cleanJsonStr);
        auditResult.id = `${owner}-${repo}-${Date.now()}`;
        auditResult.repoUrl = repoUrl;
        auditResult.date = new Date().toISOString();
      } catch (parseError) {
        console.error("Failed to parse JSON:", rawContent);
        return res.status(500).json({ error: "The AI model returned an invalid response format.", raw: rawContent });
      }

      return res.json(auditResult);

    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files and SPA fallback
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
