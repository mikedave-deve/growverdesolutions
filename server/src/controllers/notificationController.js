import { Notification } from "../models/Notification.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/notifications/mine
export const listMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ employee: req.user._id, archived: false }).sort({ createdAt: -1 });
  res.status(200).json({ notifications: notifications.map((n) => n.toSafeJSON()) });
});

// POST /api/notifications/mine
// For actions that don't have their own real backend endpoint yet
// (e.g. Support tickets, still mocked) — everything else inserts its
// own notification server-side as a side effect of the real action.
export const createMyNotification = asyncHandler(async (req, res) => {
  const { category, title, priority } = req.body;
  if (!category || !title) throw new AppError("Category and title are required.", 400);

  const notification = await Notification.record(req.user._id, { category, title, priority });
  res.status(201).json({ notification: notification.toSafeJSON() });
});

// PATCH /api/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, employee: req.user._id },
    { $set: { read: true } },
    { new: true }
  );
  if (!notification) throw new AppError("Notification not found.", 404);
  res.status(200).json({ notification: notification.toSafeJSON() });
});

// PATCH /api/notifications/:id/archive
export const archiveNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, employee: req.user._id },
    { $set: { archived: true } },
    { new: true }
  );
  if (!notification) throw new AppError("Notification not found.", 404);
  res.status(200).json({ notification: notification.toSafeJSON() });
});
