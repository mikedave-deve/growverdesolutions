import { User } from "../models/User.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// PATCH /api/employees/me
// Personal contact info only (name/email/phone) — employment fields
// (department/manager/etc.) stay admin/HR-only via a separate route.
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;
  const user = req.user;

  if (firstName !== undefined) {
    if (!firstName.trim()) throw new AppError("First name is required.", 400);
    user.firstName = firstName;
  }
  if (lastName !== undefined) {
    if (!lastName.trim()) throw new AppError("Last name is required.", 400);
    user.lastName = lastName;
  }
  if (email !== undefined) {
    if (!isValidEmail(email)) throw new AppError("Enter a valid email address.", 400);
    const normalized = email.toLowerCase().trim();
    if (normalized !== user.email) {
      const existing = await User.findOne({ email: normalized, _id: { $ne: user._id } });
      if (existing) throw new AppError("An account with this email already exists.", 409);
    }
    user.email = normalized;
  }
  if (phone !== undefined) user.phone = phone;

  await user.save();
  await ActivityLog.record(user._id, "Updated profile");

  res.status(200).json({ user: user.toSafeJSON() });
});

// PATCH /api/employees/me/preferences
export const updatePreferences = asyncHandler(async (req, res) => {
  const { emailNotifications, documentNotifications, payrollNotifications, logisticsNotifications, shareUsageData } = req.body;
  const user = req.user;

  if (emailNotifications !== undefined) user.preferences.emailNotifications = !!emailNotifications;
  if (documentNotifications !== undefined) user.preferences.documentNotifications = !!documentNotifications;
  if (payrollNotifications !== undefined) user.preferences.payrollNotifications = !!payrollNotifications;
  if (logisticsNotifications !== undefined) user.preferences.logisticsNotifications = !!logisticsNotifications;
  if (shareUsageData !== undefined) user.preferences.shareUsageData = !!shareUsageData;

  await user.save();
  res.status(200).json({ user: user.toSafeJSON() });
});

// POST /api/employees/me/avatar
// Any signed-in account can update their own profile photo — this is
// self-service, unlike employment fields (department/manager/etc.),
// which only admin/HR can change.
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("No image file was uploaded.", 400);

  const user = req.user;
  user.avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  await user.save();
  await ActivityLog.record(user._id, "Updated profile photo");

  res.status(200).json({ user: user.toSafeJSON() });
});
