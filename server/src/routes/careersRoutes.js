import { Router } from "express";
import rateLimit from "express-rate-limit";
import { submitResume } from "../controllers/careersController.js";
import { resumeUpload } from "../middleware/uploadMiddleware.js";

const router = Router();

// Public, unauthenticated endpoint — rate-limited against spam the
// same way registration/login are.
const resumeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many submissions. Please try again in a few minutes." },
});

router.post("/resume", resumeLimiter, resumeUpload, submitResume);

export default router;
