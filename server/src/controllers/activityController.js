import { ActivityLog } from "../models/ActivityLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const LIMIT = 50;

// GET /api/activity/mine
export const listMyActivity = asyncHandler(async (req, res) => {
  const entries = await ActivityLog.find({ employee: req.user._id })
    .sort({ createdAt: -1 })
    .limit(LIMIT);
  res.status(200).json({ activity: entries.map((e) => e.toSafeJSON()) });
});
