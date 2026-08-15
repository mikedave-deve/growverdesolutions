import { Router } from "express";
import { getStatus, clockIn, clockOut } from "../controllers/attendanceController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/status", requireAuth, getStatus);
router.post("/clock-in", requireAuth, clockIn);
router.post("/clock-out", requireAuth, clockOut);

export default router;
