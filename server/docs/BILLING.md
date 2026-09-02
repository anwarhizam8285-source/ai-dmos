# Billing (Sprint 5)

## What exists

- `GET /api/v1/analytics/billing` returns the company's `plan` field (set at
  company creation, defaulting to `"starter"` - see `server/src/routes/company.js`),
  its list price from `PRICING_TIERS` in `server/src/utils/analyticsMath.js`
  (Starter RM299 / Professional RM599 / Enterprise RM999 - matches
  `website/pricing.html`), and this month's real usage (campaigns created,
  tokens used, API cost) pulled from the existing `usage` collection.
- The frontend `BillingSnapshot.jsx` renders this as a "Plan & Usage" card,
  with an explicit note that it's not an invoice, and a disabled "Upgrade
  Plan (coming soon)" button.

## What deliberately does NOT exist

**No payment processor is integrated.** No Stripe, no 2Checkout, no
subscription webhooks, no card storage, no automated charging. This is a
deliberate scope decision, not an oversight:

- Actually charging real customers' cards is a business/legal step that
  needs the account owner to set up a real payment processor account,
  agree to its terms, and decide on billing policy (proration, trials,
  refunds, tax handling) - none of which is a coding task an AI agent should
  make unilateral decisions about or execute.
- The sprint brief's sample `calculateBillingMetrics()` invented fields that
  don't exist anywhere else in this codebase (`company.tokensUsed`,
  `company.apiCalls`, `company.paymentMethod`, `company.subscriptionStatus`,
  a fabricated "RM50 per campaign extra" line item) and would have required
  either fabricating billing data or wiring a fake charge calculation that
  looks real but isn't backed by an actual payment system. `calculateBillingSnapshot()`
  only reports numbers that are real and already tracked elsewhere in this
  codebase.

## Before charging real money

1. Pick a payment processor (Stripe is the standard choice for
   subscription SaaS and has good Malaysia/MYR support).
2. Decide the actual billing model: monthly subscription per plan? Usage-based
   overage? Annual discount? Free trial length?
3. Add the processor's SDK, webhook handling (`checkout.session.completed`,
   `invoice.paid`, `customer.subscription.deleted`, etc.), and a real
   `company.subscriptionStatus`/`stripeCustomerId` field to the schema.
4. Replace the "Upgrade Plan (coming soon)" button with a real checkout flow.
5. Get the account owner's explicit sign-off before any of this goes live
   against real customers - this is exactly the kind of "actually charges
   people money" change that needs a human decision, not an autonomous one.

Until then, accounts are provisioned and billed manually (per `website/faq.html`'s
current answer to "How is billing handled?").
