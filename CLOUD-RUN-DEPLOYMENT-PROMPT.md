# AI-DMOS Cloud Run Deployment — Claude Code Prompt

## OBJECTIVE
Deploy AI-DMOS to Google Cloud Run with custom domain

## CURRENT STATE
- Sprint 1: 8/8 features complete  
- Firebase: Configured (aidmos-production)
- Frontend: Built to client/dist/
- Backend: Node.js + Express

## TASKS

1. Copy client/dist to server/dist/
2. Update server/src/app.js to serve static files
3. Create/Update server/Dockerfile for Cloud Run
4. Update server/app.yaml configuration
5. Test build locally
6. Provide deployment command for Cloud Run

## KEY REQUIREMENTS

- Express should serve dist/ as static files
- Fallback route for React Router (all paths → index.html)
- Dockerfile: node:20-alpine, multi-stage recommended
- Expose port 3000
- Firebase credentials from environment variables
- asia-southeast1 region
- allow-unauthenticated (for public access)

## ENVIRONMENT VARIABLES
- FIREBASE_PROJECT_ID: aidmos-production
- NODE_ENV: production  
- ANTHROPIC_API_KEY: (from .env.local)

## FILES TO UPDATE/CREATE
- server/src/app.js ✏️
- server/Dockerfile 📝
- server/app.yaml 📝
- server/.dockerignore 📝
- Copy client/dist → server/dist

## OUTPUT EXPECTED
- Dockerfile ready for Cloud Run
- app.js configured for static + API
- Deployment command ready
- Testing instructions

## TESTING
- Verify dist/ copied to server/
- Test API routes respond
- Test frontend loads
- Test React routing works

---

**Time estimate:** 15-20 minutes
**Target:** Ready to deploy to Cloud Run
