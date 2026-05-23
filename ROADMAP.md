# Roadmap - AuditSaaS

La vision de ce projet est de rendre l'audit des dépôts open-source simple, automatique et performant.

## Phase 1 : Fondation (Complétée)
- [x] Initialisation du projet (Frontend Vite/React + Backend Express)
- [x] Interface d'audit complète avec Tailwind CSS
- [x] Compilation du repo cible avec `repomix` 
- [x] Analyse IA via l'API Gemini 2.5 (Flash / Pro)
- [x] Stockage en `localStorage` de l'historique de recherche
- [x] Ajout de l'affichage en temps réel des métadonnées du dépôt cible (Etoiles, Forks, Langage) via l'API GitHub

## Phase 2 : Robustesse de l'Audit (Complétée)
- [x] **Détection de code obsolète :** Augmenter le prompt système pour ignorer / détecter avec plus de rigueur les packages très obsolètes.
- [x] **Rapports Comparatifs :** Permettre l'audit d'un dépôt *contre* un autre dépôt pour trouver la meilleure option selon un contexte (ex: React Router vs TanStack Router).
- [x] **Gestion des Limites de Tokens :** Implémenter le découpage de très grosses bases de code si le contexte dépasse les spécifications `repomix` (Tronquage local MAX_CHARS).
- [x] **Tests de sécurité :** Exporter les `package.json` et valider contre la Database de Vulnerabilité (`npm audit`).

## Phase 3 : Nouvelles Intégrations API (Court Terme)
- [ ] Réintégrer `OpenRouter` avec une architecture de Fallback résiliente (Load Balancing de LLM).
- [ ] Ajouter une authentification GitHub OAuth via le backend Express pour éviter les restrictions de limites d'appels à l'API GitHub (Rate Limits `api.github.com`).
- [ ] Exporter le rapport final au format PDF ou `Markdown` propre.

## Phase 4 : Évolutivité et Déploiement (Long Terme)
- [ ] Support des dépôts privés (via Personal Access Token ou OAuth).
- [ ] Multi-ciblage d'audits : Analyser les sub-modules ou monorepos par path spécifique.
- [ ] Database persistante (PostgreSQL ou Prisma) pour la synchronisation multi-navigateurs.

## Stratégie de Performance

L'accent pour l'audit SaaS haute performance se porte sur trois piliers :
1. **La vitesse de clone & parse :** Utiliser des flags `--depth=1` ou ignorer complètement les dossiers volumineux pour alléger l'environnement.
2. **Le filtrage intelligent de Repomix :** Ne packager que les fichiers pertinents (`.ts`, `.js`, `.py`, `.rs`, `.go`) au lieu des JSON bloatés (ex: `package-lock.json`).
3. **Le Fast-Fallback :** En cas d'indisponibilité de Modèle IA, retomber de manière transparente sur l'intégration de backup fonctionnelle la plus adaptée au payload.
