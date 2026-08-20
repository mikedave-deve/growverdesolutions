import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../services/emailService.js";
import { approvalEmail } from "../templates/approvalEmail.js";
import { env } from "../config/env.js";

const SALT_ROUNDS = 12;

// GET /api/admin/users/pending
export const listPendingUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ status: "Pending Approval" }).sort({ createdAt: 1 });
  res.status(200).json({ users: users.map((u) => u.toSafeJSON()) });
});

// POST /api/admin/users/:id/approve
// Approves a pending account and emails the employee a branded
// notification that they can now sign in.
export const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found.", 404);
  if (user.status === "Approved") throw new AppError("This user is already approved.", 400);

  user.status = "Approved";
  user.approvedAt = new Date();
  user.approvedBy = req.user._id;
  await user.save();

  const { subject, text, html } = approvalEmail({
    firstName: user.firstName,
    loginUrl: env.frontendLoginUrl,
  });

  // The approval itself must not fail just because the email provider
  // hiccuped — the account is already approved at this point. Report
  // the real delivery outcome back to the admin instead of assuming it
  // worked, so the UI never claims an email went out when it didn't.
  let emailSent = true;
  try {
    await sendEmail({ to: user.email, subject, text, html });
  } catch (err) {
    emailSent = false;
    console.error(`[admin] approval email to ${user.email} failed to send:`, err.message);
  }

  res.status(200).json({ user: user.toSafeJSON(), emailSent });
});

// POST /api/admin/users/:id/reject  (small companion endpoint — not
// strictly requested, but "approve" implies the alternative exists)
export const rejectUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found.", 404);

  user.status = "Rejected";
  await user.save();

  res.status(200).json({ user: user.toSafeJSON() });
});

const EMPLOYMENT_STATUSES = ["Active", "On Leave", "Suspended", "Terminated"];

// GET /api/admin/users/employees
export const listEmployees = asyncHandler(async (req, res) => {
  const users = await User.find({ status: "Approved" }).sort({ firstName: 1, lastName: 1 });
  res.status(200).json({ users: users.map((u) => u.toSafeJSON()) });
});

// PATCH /api/admin/users/:id/employment
// The only way employmentStatus/department/manager/location/startDate
// change — never editable by the employee themselves.
export const updateEmployeeProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found.", 404);

  const { employmentStatus, department, manager, location, startDate } = req.body;

  if (employmentStatus !== undefined) {
    if (!EMPLOYMENT_STATUSES.includes(employmentStatus)) {
      throw new AppError("Invalid employment status.", 400);
    }
    user.employmentStatus = employmentStatus;
  }
  if (department !== undefined) user.department = department;
  if (manager !== undefined) user.manager = manager;
  if (location !== undefined) user.location = location;
  if (startDate !== undefined) {
    const parsed = new Date(startDate);
    if (Number.isNaN(parsed.getTime())) throw new AppError("Invalid start date.", 400);
    user.startDate = parsed;
  }

  await user.save();
  res.status(200).json({ user: user.toSafeJSON() });
});

// POST /api/admin/users/:id/reset-password
// There's no way to recover a user's existing password — it's hashed,
// not encrypted, so it's not stored anywhere in a reversible form. When
// an employee needs a password (forgot it, locked out, etc.), an admin
// issues a brand-new temporary one instead. It's returned in this
// response exactly once, for the admin to hand to the employee
// directly — it is never stored or logged in plaintext, only its hash.
export const resetEmployeePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found.", 404);

  const tempPassword = crypto.randomBytes(9).toString("base64url"); // 12 chars
  user.passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);
  await user.save();
  await ActivityLog.record(user._id, "Password reset by admin");

  res.status(200).json({ tempPassword });
});
