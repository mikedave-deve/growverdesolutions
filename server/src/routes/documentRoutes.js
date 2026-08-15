import { Router } from "express";
import { listMyDocuments, downloadDocument } from "../controllers/documentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/mine", requireAuth, listMyDocuments);
router.get("/:id/download", requireAuth, downloadDocument);

export default router;
