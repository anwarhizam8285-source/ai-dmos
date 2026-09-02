# Email Automation (Sprint 5)

## What exists

`server/src/services/emailService.js`:

- Three pure template renderers (`renderWelcomeEmail`, `renderDailyRecommendationEmail`,
  `renderWeeklyReportEmail`) - no I/O, HTML-escape every interpolated value
  (company names are user input; recommendation titles/descriptions are
  Claude-generated - both untrusted as raw HTML), unit-tested in
  `server/tests/emailService.test.js`.
- Three send wrappers (`sendWelcomeEmail`, `sendDailyRecommendationEmail`,
  `sendWeeklyReportEmail`) that call the above and hand the result to
  nodemailer via Gmail SMTP.
- `isEmailConfigured()` - true only when both `GMAIL_USER` and
  `GMAIL_APP_PASSWORD` are set in `.env.local` (currently blank). Without
  both, every send call logs a warning and returns `{ sent: false, reason:
  "not_configured" }` instead of throwing - the rest of the app never breaks
  because email isn't set up.

**`sendWelcomeEmail` is wired to fire once**, at company creation
(`server/src/routes/company.js`), fire-and-forget so a failed/unconfigured
send never blocks account creation. This is the one email trigger considered
safe to wire automatically: it's a single transactional send tied directly
to a user's own action (creating their account), not a recurring background
job, and it currently no-ops with zero real credentials configured.

## What deliberately does NOT exist

**No recurring email cron job is scheduled.** The sprint brief's daily
8am "recommendation digest" and weekly report emails are NOT hooked into
`server.js`'s cron scheduler, even though `sendDailyRecommendationEmail`/
`sendWeeklyReportEmail` exist and are ready to be called.

Why: unlike the welcome email (one send, triggered by the user's own
action), a recurring job would autonomously email every company in the
database on a schedule, indefinitely, without anyone reviewing what it's
about to send that day. That's a standing automated-messaging rule - exactly
the kind of thing that needs an explicit decision from the account owner
(what time, what content, opt-out handling, whether it should exist at all),
not something to wire up unilaterally just because credentials might
someday be configured. Once real GMAIL credentials are added and someone
has decided on cadence/content, hook `runDailyPerformanceMonitoring`'s
per-company loop (Sprint 4, `performanceMonitoringService.js`) to also call
`sendDailyRecommendationEmail` for companies with PENDING recommendations.

## Setup (when ready)

1. Generate a Gmail [App Password](https://myaccount.google.com/apppasswords)
   (not your normal Gmail password - Google blocks plain-password SMTP).
2. Set `GMAIL_USER` and `GMAIL_APP_PASSWORD` in `server/.env.local`.
3. `isEmailConfigured()` flips to `true`; the welcome email starts actually
   sending on new company signups.
4. Verify with a real signup before relying on it, or by importing
   `sendWelcomeEmail` from a one-off script pointed at your own inbox.

## Known limitations

Not live-verified in this environment - no `GMAIL_USER`/`GMAIL_APP_PASSWORD`
are configured (see above), so no real email has been sent. Template
rendering (subject lines, HTML structure, HTML-escaping of user/AI-generated
content) is unit-tested; actual SMTP delivery via nodemailer/Gmail is not.
