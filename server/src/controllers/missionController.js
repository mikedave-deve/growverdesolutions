import { Mission } from "../models/Mission.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/missions/mine
export const listMyMissions = asyncHandler(async (req, res) => {
  const missions = await Mission.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ missions: missions.map((m) => m.toSafeJSON()) });
});
