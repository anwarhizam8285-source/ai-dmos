# Cloud Run Deployment Guide

## Prerequisites
- Google Cloud SDK installed (`gcloud` CLI)
- Project: `ai-dmos-production`
- Service: `ai-dmos-backend`
- Region: `asia-southeast1` (Singapore)

## Environment Setup

```bash
# Set project
gcloud config set project ai-dmos-production

# Set region
gcloud config set run/region asia-southeast1
```

## Build & Deploy

```bash
# Build image
gcloud builds submit --tag gcr.io/ai-dmos-production/ai-dmos-backend

# Deploy to Cloud Run
gcloud run deploy ai-dmos-backend \
  --image gcr.io/ai-dmos-production/ai-dmos-backend \
  --platform managed \
  --region asia-southeast1 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --max-instances 10 \
  --min-instances 1 \
  --set-env-vars NODE_ENV=production,LOG_LEVEL=info,FIREBASE_PROJECT_ID=ai-dmos-production
```

## Environment Variables (Set in Cloud Run)

Required:
- `FIREBASE_PROJECT_ID=ai-dmos-production`
- `FIREBASE_CREDENTIALS` (service account JSON, base64 encoded)
- `JWT_SECRET` (production secret)
- `NODE_ENV=production`
- `PORT=3000`

## Monitoring

```bash
# View logs
gcloud run logs read ai-dmos-backend --limit 50

# Check service status
gcloud run services describe ai-dmos-backend

# Real-time logs
gcloud run logs read ai-dmos-backend --follow
```

## Rollback

```bash
# Rollback to previous revision
gcloud run deploy ai-dmos-backend \
  --image gcr.io/ai-dmos-production/ai-dmos-backend:REVISION_TAG
```

## Secrets Management

```bash
# Create secret for JWT_SECRET
gcloud secrets create jwt-secret --replication-policy="automatic"
echo -n "your-production-secret" | gcloud secrets versions add jwt-secret --data-file=-

# Mount secret to Cloud Run
gcloud run deploy ai-dmos-backend \
  --update-secrets JWT_SECRET=jwt-secret:latest
```
