import { Router } from "express";
import {
  submitInformationSetup, submitVerification, submitPhoneService, submitRetirementBenefits,
} from "../controllers/notifyController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { verificationUpload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post("/information-setup", requireAuth, submitInformationSetup);
router.post("/verification", requireAuth, verificationUpload, submitVerification);
router.post("/phone-service", requireAuth, submitPhoneService);
router.post("/retirement-benefits", requireAuth, submitRetirementBenefits);

export default router;
