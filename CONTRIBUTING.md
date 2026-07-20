# Contributing to AI-DMOS

## Git Workflow

1. Branch naming:
   - `feature/auth-setup`
   - `bugfix/rate-limiter-error`
   - `hotfix/critical-bug`

2. Commit messages (Conventional Commits):
   - `feat(content-agent): add caption generation`
   - `fix(auth): correct token expiry logic`
   - `docs(firestore): update schema`

3. Pull requests:
   - Require 1 reviewer
   - All tests must pass
   - No console.log() in production code

## Code Standards

See [Engineering Standards](./docs/13-ENGINEERING-STANDARDS.md)

- Naming conventions
- Testing requirements (> 80% coverage)
- Performance budgets
- Security checklist

## Testing

```bash
npm test                    # Run all tests
npm run test -- --coverage  # With coverage report
```

## Before Commit

- [ ] Tests pass
- [ ] Linting passes
- [ ] No secrets in code
- [ ] Documentation updated
