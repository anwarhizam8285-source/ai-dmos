# AI-DMOS v1.0 — Multi-Tenant AI Marketing SaaS

> AI Digital Marketing Operating System for Malaysian SMEs. Generate marketing content in < 2 minutes using AI agents.

## 🎯 Quick Links

- 📖 [Documentation](./docs/)
- 🚀 [Getting Started](#getting-started)
- 🏗️ [Architecture](./docs/ARCHITECTURE.md)
- 📝 [API Reference](./docs/API.md)
- 🚢 [Deployment](./server/DEPLOYMENT.md)

---

## 🌟 Features

- ✅ Multi-tenant SaaS architecture (Firebase)
- ✅ AI-powered content generation (Claude Sonnet 4.6)
- ✅ Real-time collaboration
- ✅ Usage tracking & cost analytics (RM-based)
- ✅ Cloud-native deployment (Cloud Run)
- ✅ GitHub Actions CI/CD pipeline
- ✅ Comprehensive health monitoring

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TailwindCSS |
| Backend | Node.js + Express 4.18 |
| Database | Firebase Firestore (asia-southeast1) |
| Auth | Firebase Authentication |
| AI | Claude Sonnet 4.6 (Anthropic) |
| Deployment | Cloud Run (asia-southeast1) |
| CI/CD | GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 24+ (LTS)
- npm 10+
- Google Cloud Project (Firebase enabled)
- Anthropic API key

### Installation

```bash
# Clone repository
git clone https://github.com/anwarhizam8285-source/ai-dmos.git
cd ai-dmos

# Install client dependencies
cd client
npm install
npm run dev

# In new terminal - Install server dependencies
cd server
npm install
npm run dev

# Server runs on http://localhost:3000
# Client runs on http://localhost:5173
```

### Environment Variables

**server/.env.local**
---

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh-token` - Refresh JWT

### Content Generation
- `POST /api/v1/generate/caption` - Generate caption
- `POST /api/v1/generate/content` - Generate content

### Health Check
- `GET /health` - Simple health check
- `GET /health/detailed` - Detailed status
- `GET /health/ready` - Kubernetes readiness
- `GET /health/live` - Kubernetes liveness

See [API Reference](./docs/API.md) for full details.

---

## 🏗️ Project Structure
---

## 📖 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design & multi-tenant approach
- [API Reference](./docs/API.md) - Complete endpoint documentation
- [Deployment](./server/DEPLOYMENT.md) - Cloud Run setup guide
- [Contributing](./CONTRIBUTING.md) - Development guidelines

---

## 🚢 Deployment

### Cloud Run (Production)

```bash
cd server
gcloud builds submit --tag gcr.io/ai-dmos-production/ai-dmos-backend

gcloud run deploy ai-dmos-backend \
  --image gcr.io/ai-dmos-production/ai-dmos-backend \
  --platform managed \
  --region asia-southeast1 \
  --memory 512Mi \
  --cpu 1
```

See [Deployment Guide](./server/DEPLOYMENT.md) for detailed instructions.

---

## 🔒 Security

- JWT-based authentication
- Firestore security rules with tenant isolation (RBAC)
- Docker best practices (non-root user)
- Helmet.js for HTTP security headers
- CORS configured
- Environment variable management

---

## 📊 Monitoring

### Health Endpoints
```bash
# Simple check
curl http://localhost:3000/health

# Detailed status
curl http://localhost:3000/health/detailed

# Readiness (Kubernetes)
curl http://localhost:3000/health/ready

# Liveness (Kubernetes)
curl http://localhost:3000/health/live
```

### Logs
```bash
# Local development
npm run dev

# Cloud Run
gcloud run logs read ai-dmos-backend --limit 50
```

---

## 📈 Roadmap

### Sprint 0 (Complete) ✅
- GitHub monorepo
- React + Vite frontend
- Express API
- Firebase Auth
- Firestore schema
- Cloud Run deployment
- GitHub Actions CI/CD
- Anthropic API integration
- Health monitoring
- Documentation

### Sprint 1 (In Progress)
- User login/register UI
- Company profile management
- Dashboard
- Knowledge loader
- AI agents integration
- Content history

### Sprint 2+ (Backlog)
Based on dogfooding feedback from KIRA Senang

---

## 💰 Pricing Model

Pay-as-you-go based on API tokens used:
- Input tokens: $3 per 1M tokens (~RM13.20)
- Output tokens: $15 per 1M tokens (~RM66)
- Typical caption: <RM0.10

---

## 📝 License

PROPRIETARY - All rights reserved

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📧 Support

For issues and questions:
- GitHub Issues: [ai-dmos issues](https://github.com/anwarhizam8285-source/ai-dmos/issues)
- Email: team@kirasenang.my

---

**Last Updated:** July 20, 2026  
**Version:** 1.0.0-alpha
