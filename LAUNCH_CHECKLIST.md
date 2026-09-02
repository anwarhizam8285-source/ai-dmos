# AI-DMOS Public Launch Checklist

**Honest status as of 2026-09-02 (end of Sprint 5).** Unlike a blank template,
every line below reflects what's actually true in this codebase right now -
checked items are verified, not aspirational. **This project is not ready
for public launch.** The product core (content, campaigns, optimization,
analytics) is solid and live-tested; the business/legal/marketing
infrastructure a real public launch needs largely isn't built yet, and
several of those items (payment processing, sending real marketing email,
publishing a public site) are things this assistant should not do
unilaterally regardless of code readiness - they need the account owner's
explicit decisions.

## ✅ Technical

- [x] Both servers run without errors locally (verified repeatedly via live
      smoke tests, Sprints 3-5)
- [x] Jest test suite passing (81/81 as of Sprint 5)
- [ ] Database backups - **not configured**. Firestore has no scheduled
      export/backup policy set up.
- [ ] SSL/HTTPS - **not applicable yet**. Nothing is deployed to a public
      domain; local dev only.
- [ ] API rate limiting - **not implemented**. No rate-limiting middleware
      exists on any route.
- [ ] Structured error logging/monitoring - **partial**. `winston` is a
      declared dependency but is never actually imported/used anywhere in
      `server/src` - all logging today is `console.log`/`console.error`. No
      external monitoring (Sentry, etc.) is wired up.
- [ ] Cloud Run auto-scaling - **unverified**. `server/Dockerfile`,
      `cloudbuild.yaml`, and `app.yaml` exist (from an earlier sprint) but
      whether this has ever actually been deployed to Cloud Run, and whether
      it works, is unverified in this session.
- [ ] CI/CD pipelines green - **unverified**. `.github/workflows/ci-cd.yml`
      and `security.yml` exist but weren't triggered/checked in this session.

## ✅ Product

- [x] Campaign generation working end-to-end (Sprint 3 - live Claude call +
      real Meta Campaign/AdSet creation, browser-verified)
- [x] Optimization recommendations generating and applying (Sprint 4 - live
      Claude call + apply/reject/undo dispatch verified with a fake Meta
      client; real Meta API calls code-reviewed, not live-verified - no Meta
      account is connected in this environment yet)
- [x] Analytics dashboard displaying correct data (Sprint 5 - live-verified
      with real Firestore data: spend-weighted ROAS, top/bottom performers,
      CSV export)
- [ ] Email notifications sending - **built, not live-verified**. Templates
      are unit-tested; no `GMAIL_USER`/`GMAIL_APP_PASSWORD` are configured,
      so no real email has ever been sent by this codebase.
- [x] Onboarding flow (Sprint 5 - browser-verified: welcome → knowledge →
      Meta Ads → optimization → dashboard, "take me there" jumps correctly)
- [ ] Mobile responsive design - **partially done, not device-tested**. CSS
      has `@media` breakpoints throughout; never opened on an actual mobile
      viewport or device in this session.
- [ ] Cross-browser tested - **Chrome only**. All browser verification in
      Sprints 3-5 used Chrome via automation; Safari/Firefox untested.
- [x] No console errors on pages tested this session (Dashboard, Meta Ads,
      Analytics, Onboarding) - not an exhaustive audit of every screen/state.

## ✅ Business

- [ ] Pricing tiers - **displayed, not a confirmed business decision**.
      `website/pricing.html` shows Starter RM299 / Professional RM599 /
      Enterprise RM999, matching `PRICING_TIERS` in `analyticsMath.js` for
      consistency - but nobody has signed off on these as final launch prices.
- [ ] Payment processor - **deliberately not integrated**. See
      `server/docs/BILLING.md` - this needs the account owner to choose a
      processor and billing model; not a decision to make autonomously.
- [ ] Terms & Conditions - **not written**.
- [ ] Privacy policy - **not written**.
- [ ] Support email - **placeholder only** (`hello@example.com` in the
      website, not a real inbox).
- [x] FAQ page exists (`website/faq.html`) with honest, non-fabricated
      answers - including "billing is manual for now."
- [ ] Customer success playbook - **not written**.
- [ ] First customers lined up - outside this codebase's scope; a sales
      activity, not an engineering one.

## ✅ Marketing

- [x] Marketing website built (`website/index.html`, `features.html`,
      `pricing.html`, `faq.html`) - **static files, not deployed anywhere**.
      CTA links point at `http://localhost:5173` with an inline comment to
      update before going live.
- [ ] Landing page conversion-optimized - built, never A/B tested or
      analyzed (no traffic exists yet).
- [ ] Social media accounts - not created; outside this codebase's scope.
- [x] **Deliberately no fabricated testimonials.** The sprint brief's sample
      copy included invented named quotes ("Ahmad, CEO at TechStartup...").
      Presenting fake customer testimonials as real is misleading marketing
      copy, so none were added - the site currently has zero testimonials
      rather than fake ones. Add real quotes once real customers exist.
- [ ] Press release - not drafted.
- [ ] Email list - not created.
- [ ] Landing page email capture form - not built (the site only links to
      the app; no standalone signup-for-updates form exists).

## ✅ Documentation

- [x] Engineering/API documentation is extensive: `server/docs/API_ROUTES.md`,
      `ANALYTICS.md`, `OPTIMIZATION_ENGINE.md`, `PERFORMANCE_MONITORING.md`,
      `CAMPAIGN_CREATION.md`, `META_CAMPAIGN_API.md`, `BILLING.md`,
      `EMAIL_AUTOMATION.md`, `FIRESTORE_SCHEMA.md`, plus per-sprint
      `SPRINT-N-COMPLETION.md` files with deviations and known limitations.
- [ ] End-user documentation - **not written**. Everything above is
      engineering-facing; there's no "how to use AI-DMOS" guide for an
      actual customer.
- [ ] Video tutorials - not recorded.
- [ ] Help center - not built (the FAQ page is a start, not a full help center).
- [ ] Admin guide - not written.

## What would actually need to happen before this launches

1. A real decision (from the account owner, not this assistant) on payment
   processing, pricing, and legal terms (T&Cs, privacy policy).
2. A real Meta OAuth connection completed once, to finally live-verify the
   Sprint 3/4 Meta API paths that are currently only code-reviewed
   (`approve-campaign`, `apply-recommendation`, `undo-recommendation`, and
   the daily monitoring cron's real Insights pull).
3. Deployment verification (does Cloud Run actually work? does CI pass?)
   and basic production hardening (rate limiting, real logging/monitoring,
   backups).
4. A decision on email automation cadence/content, then real Gmail
   credentials, then careful testing before it emails real people.
5. End-user docs and a real support inbox before directing traffic at the
   FAQ page's `mailto:` link.

None of the above are code the assistant should complete unilaterally in a
future sprint without the account owner weighing in first - they're
business, legal, and infrastructure decisions, not implementation details.
