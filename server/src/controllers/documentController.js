import { Document } from "../models/Document.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isAdminRole } from "../utils/roles.js";

// GET /api/documents/mine
export const listMyDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ documents: documents.map((d) => d.toSafeJSON()) });
});

// Only these are safe to ever render inline in the browser. Since
// admin can upload literally any file type, an arbitrary HTML or SVG
// file rendered inline (rather than downloaded) could execute script
// in the employee's own session — so anything not on this allowlist
// is always forced to download instead of opening in the tab.
const INLINE_SAFE_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"];

// GET /api/documents/:id/download
// Only the owning employee or an admin/HR account can fetch the file
// itself — everyone else gets a 404 rather than a 403, so this
// doesn't confirm which documents exist for other employees.
export const downloadDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id).select("+fileData");
  if (!document) throw new AppError("Document not found.", 404);

  const isOwner = document.employee.toString() === req.user._id.toString();
  if (!isOwner && !isAdminRole(req.user.role)) {
    throw new AppError("Document not found.", 404);
  }
  if (isOwner) {
    await ActivityLog.record(req.user._id, `Downloaded ${document.name}`);
  }

  const disposition = INLINE_SAFE_MIME_TYPES.includes(document.mimeType) ? "inline" : "attachment";
  res.set({
    "Content-Type": document.mimeType || "application/octet-stream",
    "Content-Disposition": `${disposition}; filename="${encodeURIComponent(document.fileName)}"`,
    "Content-Length": document.fileSize,
    "X-Content-Type-Options": "nosniff",
  });
  res.send(document.fileData);
});
