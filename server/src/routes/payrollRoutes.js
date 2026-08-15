import { Router } from "express";
import {
  getCurrent, getHistory, getDepositAccounts, addDepositAccount,
  getTransfers, submitTransfer, confirmTransfer,
} from "../controllers/payrollController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

router.get("/current", getCurrent);
router.get("/history", getHistory);
router.get("/deposit-accounts", getDepositAccounts);
router.post("/deposit-accounts", addDepositAccount);
router.get("/transfers", getTransfers);
router.post("/transfers", submitTransfer);
router.post("/transfers/:id/confirm", confirmTransfer);

export default router;
