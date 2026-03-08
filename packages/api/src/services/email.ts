import { Resend } from "resend";
import { config } from "../config.js";

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[email] To: ${to} | Subject: ${subject}`);
    console.log(`[email] (No RESEND_API_KEY set — email not sent)`);
    return;
  }

  const { error } = await resend.emails.send({
    from: config.fromEmail,
    to,
    subject,
    html,
  });

  if (error) {
    console.error(`[email] Failed to send to ${to}:`, error);
  }
}

export async function sendConfirmationEmail(
  email: string,
  projectName: string,
  confirmUrl: string
) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
      <h2 style="color: #111; margin: 0 0 16px;">Confirm your subscription</h2>
      <p style="color: #555; line-height: 1.6; margin: 0 0 24px;">
        You requested to receive changelog updates from <strong>${escapeHtml(projectName)}</strong>.
        Click the button below to confirm your subscription.
      </p>
      <a href="${escapeHtml(confirmUrl)}" style="display: inline-block; background: #6366f1; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
        Confirm Subscription
      </a>
      <p style="color: #999; font-size: 13px; margin: 24px 0 0;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  await send(email, `Confirm your subscription to ${projectName}`, html);
}

export async function sendNewEntryNotification(
  subscribers: Array<{ email: string; token: string }>,
  project: { name: string; slug: string },
  entry: { title: string; content: string },
  categories: string[]
) {
  const changelogUrl = `${config.baseUrl}/${project.slug}`;

  const categoryBadges = categories
    .map(
      (c) =>
        `<span style="display:inline-block;background:#f0f0f0;color:#555;padding:2px 8px;border-radius:4px;font-size:12px;margin-right:4px;">${escapeHtml(c)}</span>`
    )
    .join("");

  for (const sub of subscribers) {
    const unsubscribeUrl = `${config.baseUrl}/api/subscribe/unsubscribe/${sub.token}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
        <p style="color: #999; font-size: 13px; margin: 0 0 8px;">${escapeHtml(project.name)} Changelog</p>
        <h2 style="color: #111; margin: 0 0 12px;">${escapeHtml(entry.title)}</h2>
        ${categoryBadges ? `<div style="margin: 0 0 16px;">${categoryBadges}</div>` : ""}
        <div style="color: #333; line-height: 1.6; margin: 0 0 24px;">
          ${truncateContent(entry.content, 300)}
        </div>
        <a href="${escapeHtml(changelogUrl)}" style="display: inline-block; background: #6366f1; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
          Read Full Update
        </a>
        <p style="color: #999; font-size: 12px; margin: 24px 0 0;">
          <a href="${escapeHtml(unsubscribeUrl)}" style="color: #999;">Unsubscribe</a>
        </p>
      </div>
    `;

    await send(sub.email, `${project.name}: ${entry.title}`, html);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncateContent(content: string, maxLen: number): string {
  const stripped = content.replace(/<[^>]*>/g, "").replace(/[#*_`~\[\]]/g, "");
  if (stripped.length <= maxLen) return escapeHtml(stripped);
  return escapeHtml(stripped.slice(0, maxLen).trim()) + "…";
}
