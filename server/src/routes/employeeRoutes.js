import { Router } from "express";
import { uploadAvatar, updateProfile, updatePreferences } from "../controllers/employeeController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { avatarUpload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.patch("/me", requireAuth, updateProfile);
router.patch("/me/preferences", requireAuth, updatePreferences);
router.post("/me/avatar", requireAuth, avatarUpload, uploadAvatar);

export default router;
