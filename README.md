# AI-DMOS (AI Digital Marketing Operating System)

AI-powered marketing platform for Malaysian SMEs.

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Google Cloud account (Cloud Run)
- Anthropic API key

### Setup

```bash
# Install dependencies (both workspaces)
npm install

# Run development servers
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:3000

# Run tests
npm test

# Build for production
npm run build

# Deploy to Cloud Run
npm run deploy
```

## Architecture

- **Frontend:** React 19 + Vite + Tailwind
- **Backend:** Node.js + Express
- **Database:** Firebase Firestore (asia-southeast1)
- **AI:** Claude Sonnet 4.6
- **Deployment:** Cloud Run + Firebase Hosting

## Documentation

- [Product Requirements](./docs/01-PRODUCT-REQUIREMENTS.md)
- [System Architecture](./docs/02-SYSTEM-ARCHITECTURE.md)
- [Database Schema](./docs/04-FIRESTORE-SCHEMA.md)
- [Engineering Standards](./docs/13-ENGINEERING-STANDARDS.md)
- [Scope Lock](./SCOPE-LOCK.md)
- [Sprint 0 Checklist](./SPRINT-0-CHECKLIST.md)
- [Sprint 1 Checklist](./SPRINT-1-CHECKLIST.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

Proprietary - KIRA Senang Solutions
