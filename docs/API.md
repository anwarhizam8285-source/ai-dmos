# API Reference — AI-DMOS v1.0

## Base URL
## Authentication

All endpoints (except `/health`) require JWT token in Authorization header:
---

## Authentication Endpoints

### Register User
### Login User
### Get Current User
### Logout
### Refresh Token
---

## Content Generation Endpoints

### Generate Caption
### Generate Content
---

## Health Check Endpoints

### Simple Health Check
### Detailed Health Status
### Readiness Probe (Kubernetes)
### Liveness Probe (Kubernetes)
---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: email, password"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid token"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently unlimited. Rate limiting to be added in Sprint 1.

---

## Changelog

### v1.0.0-alpha (July 20, 2026)
- Initial release
- Authentication with JWT
- Content generation endpoints
- Health monitoring
- Cloud Run deployment ready

---

**Last Updated:** July 20, 2026
