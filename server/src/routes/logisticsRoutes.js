import { Router } from "express";
import { trackShipment, getMyShipment } from "../controllers/logisticsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/mine", requireAuth, getMyShipment);
router.get("/track/:trackingNumber", requireAuth, trackShipment);

export default router;
