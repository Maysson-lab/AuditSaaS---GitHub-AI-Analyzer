import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

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

      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OPENROUTER_API_KEY is missing in environment variables" });
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

      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (!repoRes.ok) {
        return res.status(404).json({ error: "Repository not found or access denied." });
      }
      const repoData = await repoRes.json();

      let readmeContent = "No README found.";
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
        if (readmeRes.ok) {
          const readmeJson = await readmeRes.json();
          readmeContent = Buffer.from(readmeJson.content, 'base64').toString('utf-8');
        }
      } catch (e) {
        console.warn("Could not fetch readme", e);
      }

      // Fetch codebase summary
      let codebaseMd = "Codebase not fetched.";
      try {
        const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`, { headers });
        if (treeRes.ok) {
           const treeData = await treeRes.json();
           const extAllowList = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.py', '.go', '.java', '.cpp', '.h', '.rs', '.css'];
           const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'out', 'coverage', 'vendor', '__pycache__', 'public'];
           
           let files = (treeData.tree || []).filter((item: any) => {
               if (item.type !== 'blob') return false;
               if (ignoreDirs.some(ignored => item.path.includes(`${ignored}/`) || item.path.startsWith(`${ignored}/`))) return false;
               
               const ext = item.path.split('.').pop() ? '.' + item.path.split('.').pop() : '';
               if (!extAllowList.includes(ext) && !['Dockerfile', 'Makefile'].includes(item.path.split('/').pop() || '')) return false;
               if (item.size > 50000) return false;
               return true;
           });

           files.sort((a: any, b: any) => {
               const priorityScore = (f: any) => {
                   let score = 0;
                   if (f.path === 'package.json' || f.path === 'README.md') score += 100;
                   if (f.path.startsWith('src/')) score += 50;
                   if (f.path.includes('config') || f.path.includes('env')) score += 30;
                   return score;
               };
               return priorityScore(b) - priorityScore(a) || a.size - b.size;
           });

           files = files.slice(0, 15);
           
           const fileContents = await Promise.all(files.map(async (file: any) => {
               try {
                   const fileRes = await fetch(file.url, { headers });
                   if (!fileRes.ok) return null;
                   const fileData = await fileRes.json();
                   const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
                   return `## /${file.path}\n\`\`\`\n${content.substring(0, 3000)}\n\`\`\``;
               } catch(e) { return null; }
           }));

           codebaseMd = `# Repository File Tree Extract\nShowing top ${files.length} relevant files.\n\n` + fileContents.filter(Boolean).join('\n\n');
        }
      } catch (e) {
        console.warn("Could not fetch codebase tree", e);
      }

      // 3. Prepare OpenRouter LLM Call
      const systemPrompt = `You are a Senior Software Engineer specializing in SaaS, architecture scalability, and AI systems. Your objective is to audit a GitHub repository based on its metadata, README, and the provided codebase extract.
You MUST reply with ONLY a pure JSON object conforming to the following structure:
{
  "score": number (0-100),
  "summary": "string (A concise overall verdict)",
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "security": { "score": number, "notes": "string" },
  "architecture": { "score": number, "notes": "string" },
  "recommendations": ["string", "string"]
}
Do not include any markdown fences (like \`\`\`json) or extra text outside the JSON.`;

      const userPrompt = `Please analyze the following repository:
Name: ${repoData.full_name}
Description: ${repoData.description || 'None'}
Stars: ${repoData.stargazers_count}
Forks: ${repoData.forks_count}
Language: ${repoData.language}
Open Issues: ${repoData.open_issues_count}

README Snippet (first 4000 chars):
${readmeContent.substring(0, 4000)}

Codebase Extract:
${codebaseMd.substring(0, 50000)}
`;

      const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
          "X-Title": "AuditSaaS"
        },
        body: JSON.stringify({
          models: Array.from(new Set([
            model,
            "deepseek/deepseek-v4-flash:free",
            "google/gemma-4-31b-it:free"
          ])).slice(0, 3),
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      });

      if (!openRouterRes.ok) {
        const errText = await openRouterRes.text();
        console.error("OpenRouter Error:", errText);
        try {
          const errObj = JSON.parse(errText);
          let extraMessage = "";
          if (errObj.error?.metadata?.raw) {
            try {
               const rawObj = JSON.parse(errObj.error.metadata.raw);
               if (rawObj.error?.message) extraMessage = " - " + rawObj.error.message;
            } catch(e) {
               if (typeof errObj.error.metadata.raw === "string") extraMessage = " - " + errObj.error.metadata.raw;
            }
          }
          if (errObj.error && errObj.error.message) {
             return res.status(openRouterRes.status).json({ error: `OpenRouter: ${errObj.error.message}${extraMessage}` });
          }
        } catch(e) {}
        return res.status(500).json({ error: "Error communicating with OpenRouter API. Check if your API key is valid and has credits." });
      }

      const aiData = await openRouterRes.json();
      const rawContent = aiData.choices[0].message.content;
      
      // Clean up potential markdown fences if the model ignored instructions
      const cleanJsonStr = rawContent.replace(/^```json/m, '').replace(/^```/m, '').replace(/```$/m, '').trim();

      let auditResult;
      try {
        auditResult = JSON.parse(cleanJsonStr);
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
