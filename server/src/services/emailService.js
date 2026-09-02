import nodemailer from "nodemailer";

const APP_URL = process.env.FRONTEND_URL || "http://localhost:5173";

let cachedTransporter = null;

// Email is opt-in infrastructure: without GMAIL_USER/GMAIL_APP_PASSWORD set,
// every send() call logs and no-ops rather than throwing. Nothing in this
// codebase currently calls sendXEmail() automatically - see
// server/docs/EMAIL_AUTOMATION.md for why the daily-digest cron job is
// deliberately NOT wired up yet (this would send real email to real
// customers on a schedule, which needs an explicit decision, not an
// autonomous one).
export function isEmailConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
  }
  return cachedTransporter;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function layout(bodyHtml) {
  return `<div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; color: #1a202c;">
    ${bodyHtml}
    <p style="color: #999; font-size: 12px; margin-top: 32px;">AI-DMOS - your GTM engineer in a box.</p>
  </div>`;
}

// --- Pure template renderers (no I/O - unit-testable) ---

export function renderWelcomeEmail({ companyName }) {
  const name = escapeHtml(companyName);
  return {
    subject: "Welcome to AI-DMOS - your GTM engineer awaits! 🎉",
    html: layout(`
      <h1>Welcome to AI-DMOS 🚀</h1>
      <p>Hi ${name},</p>
      <p>We're excited to have you on board! Here's what to do next:</p>
      <ol>
        <li>Upload a knowledge document so AI writes on-brand copy</li>
        <li>Connect your Meta Ads account</li>
        <li>Generate your first AI campaign (takes about 2 minutes)</li>
        <li>Let AI optimize it daily</li>
      </ol>
      <p><a href="${APP_URL}">Start now →</a></p>
    `),
  };
}

export function renderDailyRecommendationEmail({ companyName, campaignName, recommendations }) {
  const name = escapeHtml(companyName);
  const items = recommendations
    .map(
      (rec) => `
      <div style="border-left: 4px solid #667eea; padding: 12px 16px; margin: 12px 0; background: #f7fafc;">
        <strong>${escapeHtml(rec.title)}</strong>
        <p style="margin: 8px 0; color: #4a5568;">${escapeHtml(rec.description)}</p>
        <p style="margin: 0; font-size: 13px; color: #718096;">Expected impact: ${escapeHtml(rec.expectedImpact?.change)} ${escapeHtml(rec.expectedImpact?.metric)}</p>
      </div>`
    )
    .join("");

  return {
    subject: `${recommendations.length} new optimization ${recommendations.length === 1 ? "recommendation" : "recommendations"} for ${companyName} 🎯`,
    html: layout(`
      <h2>Daily AI Optimization Report 📊</h2>
      <p>Hi ${name}, we analyzed <strong>${escapeHtml(campaignName)}</strong> and found ${recommendations.length} recommendation(s):</p>
      ${items}
      <p><a href="${APP_URL}">Review and apply →</a></p>
    `),
  };
}

export function renderWeeklyReportEmail({ companyName, metrics }) {
  const name = escapeHtml(companyName);
  return {
    subject: "Your weekly campaign performance report 📈",
    html: layout(`
      <h2>Weekly Performance Report 📈</h2>
      <p>Hi ${name}, here's how your campaigns performed this week:</p>
      <div style="background: #f7fafc; padding: 16px; border-radius: 8px;">
        <div>Total Spend: <strong>RM${metrics.spend}</strong></div>
        <div>Total Results: <strong>${metrics.results}</strong></div>
        <div>Average ROAS: <strong>${metrics.averageRoas}x</strong></div>
      </div>
      <p><a href="${APP_URL}">View full analytics →</a></p>
    `),
  };
}

// --- Send wrapper (I/O - no-ops without credentials) ---

async function send({ to, subject, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[emailService] Not configured - would have sent "${subject}" to ${to}`);
    return { sent: false, reason: "not_configured" };
  }
  await transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, html });
  return { sent: true };
}

export async function sendWelcomeEmail(to, companyName) {
  return send({ to, ...renderWelcomeEmail({ companyName }) });
}

export async function sendDailyRecommendationEmail(to, companyName, campaignName, recommendations) {
  return send({ to, ...renderDailyRecommendationEmail({ companyName, campaignName, recommendations }) });
}

export async function sendWeeklyReportEmail(to, companyName, metrics) {
  return send({ to, ...renderWeeklyReportEmail({ companyName, metrics }) });
}

export default {
  isEmailConfigured,
  renderWelcomeEmail,
  renderDailyRecommendationEmail,
  renderWeeklyReportEmail,
  sendWelcomeEmail,
  sendDailyRecommendationEmail,
  sendWeeklyReportEmail,
};
