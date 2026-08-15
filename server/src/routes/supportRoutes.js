import { Router } from "express";
import { listMyTickets, submitTicket } from "../controllers/supportController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/tickets/mine", requireAuth, listMyTickets);
router.post("/tickets/mine", requireAuth, submitTicket);

export default router;
