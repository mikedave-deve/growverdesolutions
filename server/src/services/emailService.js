import { env } from "../config/env.js";

const API_BASE = "https://api.mail.hostinger.com";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The mailbox's resourceId (needed for the /send path) doesn't change for
// the lifetime of the process, so resolve it once from GET /api/v1/me and
// reuse it — avoids an extra API round trip on every email sent.
let cachedMailboxResourceId;

async function resolveMailboxResourceId() {
  if (cachedMailboxResourceId) return cachedMailboxResourceId;

  const res = await fetch(`${API_BASE}/api/v1/me`, {
    headers: { Authorization: `Bearer ${env.hostinger.apiToken}` },
  });
  if (!res.ok) {
    throw new Error(`Hostinger Mail API auth failed (${res.status}): ${await res.text()}`);
  }

  const { data } = await res.json();
  const mailbox = data.mailboxes.find((m) => m.address === env.hostinger.mailboxAddress);
  if (!mailbox) {
    throw new Error(
      `Hostinger API token doesn't have access to mailbox "${env.hostinger.mailboxAddress}" ` +
      `(set HOSTINGER_MAILBOX_ADDRESS to match a mailbox the token can manage).`
    );
  }

  cachedMailboxResourceId = mailbox.resourceId;
  return cachedMailboxResourceId;
}

function toBase64(content) {
  return Buffer.isBuffer(content) ? content.toString("base64") : Buffer.from(content).toString("base64");
}

export async function sendEmail({ to, subject, text, html, attachments }) {
  // No API token configured — log to the console instead of sending. Keeps
  // the whole registration → approval → email flow runnable and
  // demonstrable without real email infrastructure set up first.
  if (!env.hostinger.apiToken) {
    console.warn(
      "[email] No HOSTINGER_API_TOKEN configured — emails will be logged to the console instead of sent. " +
      "Set HOSTINGER_API_TOKEN in server/.env to send real email."
    );
    console.log(`[email] (dev fallback) would send to ${to}:\nSubject: ${subject}\n\n${text || html}`);
    return { dev: true };
  }

  const mailboxResourceId = await resolveMailboxResourceId();
  const body = {
    to: [to],
    displayName: env.hostinger.displayName,
    subject,
    text,
    html,
    ...(attachments?.length
      ? {
          attachments: attachments.map((a) => ({
            filename: a.filename,
            content: toBase64(a.content),
            contentType: a.contentType,
          })),
        }
      : {}),
  };

  const attempt = () =>
    fetch(`${API_BASE}/api/v1/mailboxes/${mailboxResourceId}/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.hostinger.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

  let res = await attempt();
  if (!res.ok) {
    const errText = await res.text();
    console.warn(`[email] first attempt to ${to} failed (${res.status}: ${errText}) — retrying once…`);
    await delay(500);
    res = await attempt();
  }

  if (!res.ok) {
    throw new Error(`Hostinger Mail API send failed (${res.status}): ${await res.text()}`);
  }

  console.log(`[email] sent to ${to} via Hostinger Mail API`);
  return { ok: true };
}
