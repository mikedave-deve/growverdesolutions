import dotenv from "dotenv";
dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  mongodbUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/growverde"),
  jwtSecret: required("JWT_SECRET", "dev-only-insecure-secret-change-me"),
  jwtExpiresInDays: Number(process.env.JWT_EXPIRES_IN_DAYS || 7),
  jwtExpiresInDaysRemember: Number(process.env.JWT_EXPIRES_IN_DAYS_REMEMBER || 30),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  frontendLoginUrl: process.env.FRONTEND_LOGIN_URL || "http://localhost:5173/login",
  // Email is sent through Hostinger's HTTP Mail API (api.mail.hostinger.com)
  // rather than raw SMTP — Render blocks outbound SMTP ports (25/465/587)
  // at the network level, which silently failed every submission email in
  // production regardless of which SMTP provider was configured. The Mail
  // API goes over plain HTTPS, which isn't blocked. See server/README.md.
  hostinger: {
    apiToken: process.env.HOSTINGER_API_TOKEN || "",
    // The Hostinger mailbox to send from — falls back to SMTP_USER so an
    // existing local setup keeps working without adding a new var.
    mailboxAddress: process.env.HOSTINGER_MAILBOX_ADDRESS || process.env.SMTP_USER || "",
    displayName: process.env.EMAIL_DISPLAY_NAME || "Growverde Solutions",
  },
  // Where internal submissions (Information Setup, etc.) get emailed —
  // defaults to the SMTP account itself since that's already the
  // company inbox in every environment this has been configured for.
  companyNotifyEmail: process.env.COMPANY_NOTIFY_EMAIL || process.env.SMTP_USER || "",
};
