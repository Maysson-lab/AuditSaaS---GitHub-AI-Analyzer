# AuditSaaS

AuditSaaS est un outil performant d'analyse et d'audit automatique de dépôts GitHub. Il évalue la santé globale, la qualité de l'architecture, et le niveau de sécurité du code.

## Fonctionnalités Principales

- **Analyse Statique & IA :** Utilise une combinaison d'analyses statiques (via Repomix) et l'analyse par les modèles de langage Gemini (et OpenRouter dans les futures itérations) pour examiner le code en profondeur.
- **Tableau de Bord Intuitif :** Une interface utilisateur propre et réactive (React, Tailwind CSS) présentant un résumé exécutif, des points forts, des points faibles, et des recommandations actionnables.
- **Analyse Contextuelle des Dépôts :** Le système de bord récupère directement les métadonnées de GitHub (nombre d'étoiles, forks, langage principal et date de dernière mise à jour) pour l'afficher graphiquement au-dessus du rapport.
- **Métriques Détaillées :** Fournit un score global, un score d'architecture, et un score de sécurité de 0 à 100.
- **Historique Local :** Stocke vos analyses récentes pour y accéder facilement sans relancer un audit complet.

## Architecture & Technologies

- **Frontend :** 
  - React 18+ & TypeScript
  - Vite.js (Build tool & Serveur de démo)
  - Tailwind CSS & Lucide React (Design & Icônes)
- **Backend :**
  - Node.js & Express
  - Fetch + Repomix + Google GenAI SDK

## Installation & Lancement Rapide

1. **Cloner le dépôt**
   ```bash
   git clone <repo_url>
   cd <project_dir>
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Variables d'Environnement**
   Créez un fichier `.env` basé sur `.env.example` et ajoutez votre `GEMINI_API_KEY`.

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   Le serveur sera disponible sur `http://localhost:3000`.

## Déploiement

Le code est prêt pour un déploiement Cloud Run via `npm run build` et `npm start` (produisant un binaire commun `dist/server.cjs`).

## Contribuer

Veuillez lire le fichier de spécifications et formater le code avant de soumettre une pull request. Les tests peuvent être passés localement.
