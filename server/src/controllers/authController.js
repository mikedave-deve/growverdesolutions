import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken, setSessionCookie, clearSessionCookie, readSessionCookie, verifyToken } from "../utils/token.js";
import { sendEmail } from "../services/emailService.js";
import { resetPasswordEmail } from "../templates/resetPasswordEmail.js";
import { env } from "../config/env.js";

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// POST /api/auth/register
// Creates a Pending Approval account. Never signs the user in — a
// pending account cannot receive a session, by design.
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  if (!firstName || !lastName) throw new AppError("First and last name are required.", 400);
  if (!isValidEmail(email)) throw new AppError("Enter a valid email address.", 400);
  if (!password || password.length < 8) throw new AppError("Password must be at least 8 characters.", 400);

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new AppError("An account with this email already exists.", 409);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase().trim(),
    phone,
    passwordHash,
    status: "Pending Approval",
  });

  res.status(201).json({
    user: user.toSafeJSON(),
    message:
      "Registration successful! Your account is pending admin approval. You will receive an email once approved.",
  });
});

// POST /api/auth/login
// Only Approved accounts receive a session. Pending/Rejected accounts
// get a clear, specific message instead of a generic auth failure.
export const login = asyncHandler(async (req, res) => {
  const { email, password, remember } = req.body;

  if (!isValidEmail(email) || !password) {
    throw new AppError("Enter your email and password.", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
  if (!user) throw new AppError("Incorrect email or password.", 401);

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    await ActivityLog.record(user._id, "Failed sign-in attempt", "Failed");
    throw new AppError("Incorrect email or password.", 401);
  }

  if (user.status === "Pending Approval") {
    throw new AppError(
      "Your account is still awaiting admin approval. You'll receive an email once it's approved.",
      403,
      "PENDING_APPROVAL"
    );
  }
  if (user.status === "Rejected") {
    throw new AppError(
      "Your account was not approved. Contact your administrator for details.",
      403,
      "REJECTED"
    );
  }

  const { token, maxAgeMs } = signToken(user, { remember: Boolean(remember) });
  setSessionCookie(res, token, maxAgeMs);
  await ActivityLog.record(user._id, "Logged in");

  res.status(200).json({ user: user.toSafeJSON() });
});

// POST /api/auth/logout
// Not behind requireAuth — an expired/invalid cookie should still get
// cleared. Logging the activity is best-effort: only happens if the
// cookie was actually valid.
export const logout = asyncHandler(async (req, res) => {
  try {
    const token = readSessionCookie(req);
    if (token) {
      const { sub } = verifyToken(token);
      await ActivityLog.record(sub, "Logged out");
    }
  } catch {
    // invalid/expired token — nothing to attribute the activity to
  }

  clearSessionCookie(res);
  res.status(200).json({ ok: true });
});

// GET /api/auth/session
// Returns the currently signed-in user based on the session cookie —
// used to restore a session on page reload.
export const getSession = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user.toSafeJSON() });
});

// POST /api/auth/forgot-password
// Always responds with the same generic message whether or not the
// email matches an account — that's what stops this endpoint from
// being usable to find out which emails are registered.
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!isValidEmail(email)) throw new AppError("Enter a valid email address.", 400);

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const resetUrl = `${env.frontendOrigin}/reset-password?token=${rawToken}`;
    const { subject, text, html } = resetPasswordEmail({ firstName: user.firstName, resetUrl });
    try {
      await sendEmail({ to: user.email, subject, text, html });
    } catch (err) {
      console.error(`[auth] password reset email to ${user.email} failed to send:`, err.message);
    }
  }

  res.status(200).json({
    message: "If an account exists for that email, we've sent a link to reset your password.",
  });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token) throw new AppError("This reset link is invalid or has expired.", 400);
  if (!newPassword || newPassword.length < 8) throw new AppError("New password must be at least 8 characters.", 400);

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  });
  if (!user) throw new AppError("This reset link is invalid or has expired. Request a new one.", 400);

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  await user.save();
  await ActivityLog.record(user._id, "Reset password");

  res.status(200).json({ ok: true });
});

// POST /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) throw new AppError("Current and new password are required.", 400);
  if (newPassword.length < 8) throw new AppError("New password must be at least 8 characters.", 400);

  const user = await User.findById(req.user._id).select("+passwordHash");
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw new AppError("Current password is incorrect.", 400);

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
  await ActivityLog.record(user._id, "Changed password");

  res.status(200).json({ ok: true });
});
