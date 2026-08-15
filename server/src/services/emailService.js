import nodemailer from "nodemailer";
import tls from "node:tls";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Some antivirus suites (Avast/Kaspersky/ESET "mail shield" features)
// transparently intercept outbound SMTP and re-sign it with their own
// local root certificate, which Node doesn't trust by default and
// which rejects the connection with "self-signed certificate in
// certificate chain". If server/certs/ contains a locally-trusted
// root (see server/README.md), extend Node's normal trust store with
// it instead of disabling TLS verification outright.
function loadExtraTrustedRoots() {
  const certsDir = path.join(__dirname, "../../certs");
  try {
    return fs
      .readdirSync(certsDir)
      .filter((f) => f.endsWith(".pem"))
      .map((f) => fs.readFileSync(path.join(certsDir, f), "utf8"));
  } catch {
    return [];
  }
}

// If real SMTP credentials aren't configured, fall back to a JSON
// transport that "sends" the email by logging it to the console
// instead. This keeps the whole registration → approval → email flow
// runnable and demonstrable without needing real email infrastructure
// set up first — swap in real SMTP env vars whenever they're ready
// and nothing else changes.
function buildTransport() {
  if (env.smtp.host && env.smtp.user && env.smtp.pass) {
    return nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
      tls: { ca: [...tls.rootCertificates, ...loadExtraTrustedRoots()] },
      // Gmail's SMTP hostname resolves to many rotating IPs — a single
      // one being briefly unreachable ("connect error 10060") is a
      // real, fairly common transient failure, not a config problem.
      // Without these, a hung TCP connect can take Node's/Windows'
      // default of a minute or more to give up, which is what made
      // the submit button appear to hang — fail fast instead so
      // sendEmail's retry (below) gets a chance to hit a working IP.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  console.warn(
    "[email] No SMTP credentials configured — emails will be logged to the console instead of sent. " +
    "Set SMTP_HOST/SMTP_USER/SMTP_PASS in server/.env to send real email."
  );
  return nodemailer.createTransport({ jsonTransport: true });
}

const transporter = buildTransport();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendEmail({ to, subject, text, html, attachments }) {
  const message = { from: env.emailFrom, to, subject, text, html, attachments };

  let info;
  try {
    info = await transporter.sendMail(message);
  } catch (err) {
    // One quick retry: a connect-level failure to smtp.gmail.com is
    // almost always one specific rotating IP being briefly
    // unreachable, not the account/network being blocked — a fresh
    // attempt typically resolves a different IP and just works.
    console.warn(`[email] first attempt to ${to} failed (${err.message}) — retrying once…`);
    await delay(500);
    info = await transporter.sendMail(message);
  }

  if (info.message) {
    // jsonTransport puts the whole rendered email in info.message as JSON
    console.log(`[email] (dev fallback) would send to ${to}:\n`, info.message.toString());
  } else {
    console.log(`[email] sent to ${to} (messageId: ${info.messageId})`);
  }
  return info;
}
