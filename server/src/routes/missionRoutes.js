import { Router } from "express";
import { listMyMissions } from "../controllers/missionController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/mine", requireAuth, listMyMissions);

export default router;
