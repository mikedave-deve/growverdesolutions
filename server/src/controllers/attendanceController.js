import { AttendanceEntry } from "../models/AttendanceEntry.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { formatClockTime } from "../utils/formatTime.js";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1; // week starts Monday
  x.setDate(x.getDate() - diff);
  return x;
}

function startOfMonth(d) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function entryDurationMs(entry, now) {
  return (entry.clockOutAt || now).getTime() - entry.clockInAt.getTime();
}

function hoursOf(entries, since, now) {
  const ms = entries
    .filter((e) => e.clockInAt >= since)
    .reduce((sum, e) => sum + entryDurationMs(e, now), 0);
  return Math.round((ms / 3600000) * 10) / 10;
}

function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

const HISTORY_LIMIT = 30;

// GET /api/attendance/status
export const getStatus = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = startOfMonth(now);

  // The month window covers the week and day windows too, so one
  // query is enough to compute all three totals.
  const [monthEntries, openEntry] = await Promise.all([
    AttendanceEntry.find({ employee: req.user._id, clockInAt: { $gte: monthStart } }).sort({ clockInAt: -1 }),
    AttendanceEntry.findOne({ employee: req.user._id, clockOutAt: null }),
  ]);

  const history = await AttendanceEntry.find({ employee: req.user._id })
    .sort({ clockInAt: -1 })
    .limit(HISTORY_LIMIT);

  res.status(200).json({
    clockedIn: !!openEntry,
    clockInTime: openEntry ? openEntry.clockInAt : null,
    todayHours: hoursOf(monthEntries, startOfDay(now), now),
    weeklyHours: hoursOf(monthEntries, startOfWeek(now), now),
    monthlyHours: hoursOf(monthEntries, monthStart, now),
    history: history.map((e) => ({
      id: e._id.toString(),
      date: e.clockInAt,
      clockIn: formatClockTime(e.clockInAt),
      clockOut: e.clockOutAt ? formatClockTime(e.clockOutAt) : "In progress",
      total: formatDuration(entryDurationMs(e, now)),
    })),
  });
});

// POST /api/attendance/clock-in
export const clockIn = asyncHandler(async (req, res) => {
  const existing = await AttendanceEntry.findOne({ employee: req.user._id, clockOutAt: null });
  if (existing) throw new AppError("You're already clocked in.", 400);

  const entry = await AttendanceEntry.create({ employee: req.user._id, clockInAt: new Date() });
  await ActivityLog.record(req.user._id, "Clocked in");
  res.status(201).json({ ok: true, time: entry.clockInAt });
});

// POST /api/attendance/clock-out
export const clockOut = asyncHandler(async (req, res) => {
  const entry = await AttendanceEntry.findOne({ employee: req.user._id, clockOutAt: null });
  if (!entry) throw new AppError("You're not clocked in.", 400);

  entry.clockOutAt = new Date();
  await entry.save();
  await ActivityLog.record(req.user._id, "Clocked out");
  res.status(200).json({ ok: true, time: entry.clockOutAt });
});
