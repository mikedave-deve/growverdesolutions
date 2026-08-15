import { Mission } from "../models/Mission.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { roleLabel } from "../utils/roles.js";

const PRIORITIES = ["High", "Medium", "Low"];

// GET /api/admin/users/:id/missions
export const listEmployeeMissions = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) throw new AppError("Employee not found.", 404);

  const missions = await Mission.find({ employee: employee._id }).sort({ createdAt: -1 });
  res.status(200).json({ missions: missions.map((m) => m.toSafeJSON()) });
});

// POST /api/admin/users/:id/missions
// Sends an instruction/task to one employee. The sender is always the
// signed-in admin/HR account — never something the client can spoof.
export const sendMission = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) throw new AppError("Employee not found.", 404);

  const { title, description, department, priority, deadline } = req.body;
  if (!title) throw new AppError("Title is required.", 400);
  if (!description) throw new AppError("Description is required.", 400);
  if (!deadline) throw new AppError("Date is required.", 400);
  if (priority && !PRIORITIES.includes(priority)) throw new AppError("Invalid priority.", 400);

  const parsedDeadline = new Date(deadline);
  if (Number.isNaN(parsedDeadline.getTime())) throw new AppError("Invalid date.", 400);

  const mission = await Mission.create({
    employee: employee._id,
    sentBy: req.user._id,
    senderLabel: `${req.user.firstName} ${req.user.lastName}, ${roleLabel(req.user.role)}`,
    title,
    description,
    department: department !== undefined ? department : employee.department,
    priority: priority || "Medium",
    deadline: parsedDeadline,
  });

  res.status(201).json({ mission: mission.toSafeJSON() });
});
