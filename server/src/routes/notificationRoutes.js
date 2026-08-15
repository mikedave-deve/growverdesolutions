import { Router } from "express";
import {
  listMyNotifications, createMyNotification, markNotificationRead, archiveNotification,
} from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

router.get("/mine", listMyNotifications);
router.post("/mine", createMyNotification);
router.patch("/:id/read", markNotificationRead);
router.patch("/:id/archive", archiveNotification);

export default router;
