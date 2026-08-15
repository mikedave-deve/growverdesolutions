import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const COOKIE_NAME = "gv_session";

export function signToken(user, { remember = false } = {}) {
  const days = remember ? env.jwtExpiresInDaysRemember : env.jwtExpiresInDays;
  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: `${days}d`,
  });
  return { token, maxAgeMs: days * 24 * 60 * 60 * 1000 };
}

// In production, the frontend and API are almost always on two
// different origins (e.g. a Vercel/Netlify static site calling a
// Render/Railway API) — cross-site fetch() only sends cookies when
// they're SameSite=None, and SameSite=None is only honored by
// browsers over HTTPS (secure). In local dev, frontend/API share
// effectively the same site over plain HTTP, where SameSite=None
// without secure would just be dropped — Lax is what actually works.
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  path: "/",
};

export function setSessionCookie(res, token, maxAgeMs) {
  res.cookie(COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge: maxAgeMs });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
}

export function readSessionCookie(req) {
  return req.cookies?.[COOKIE_NAME] || null;
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
