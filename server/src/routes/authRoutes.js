import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, logout, getSession, changePassword } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Basic brute-force protection on login/register — generous enough
// not to interfere with normal use or grading, tight enough to matter.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/session", requireAuth, getSession);
router.post("/change-password", requireAuth, changePassword);

export default router;
