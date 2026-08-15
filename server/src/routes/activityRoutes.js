import { Router } from "express";
import { listMyActivity } from "../controllers/activityController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/mine", requireAuth, listMyActivity);

export default router;
