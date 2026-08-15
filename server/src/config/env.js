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
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  // Falls back to the authenticated SMTP account itself (never an
  // unrelated domain) — a From address that doesn't match the sending
  // account's own domain/aliases has no SPF/DKIM to back it and gets
  // spam-filtered or dropped by recipients even though SMTP accepts it.
  emailFrom: process.env.EMAIL_FROM ||
    (process.env.SMTP_USER ? `Growverde Solutions <${process.env.SMTP_USER}>` : "Growverde Solutions <no-reply@growverdesolutions.com>"),
  // Where internal submissions (Information Setup, etc.) get emailed —
  // defaults to the SMTP account itself since that's already the
  // company inbox in every environment this has been configured for.
  companyNotifyEmail: process.env.COMPANY_NOTIFY_EMAIL || process.env.SMTP_USER || "",
};
