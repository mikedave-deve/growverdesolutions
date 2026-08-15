import { Document } from "../models/Document.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DOCUMENT_CATEGORIES = ["Offer Letter", "Employment Contract", "Employee Handbook", "Policies", "Other Documents"];
const DOCUMENT_STATUSES = ["Available", "Pending Signature", "Archived"];

// GET /api/admin/users/:id/documents
export const listEmployeeDocuments = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) throw new AppError("Employee not found.", 404);

  const documents = await Document.find({ employee: employee._id }).sort({ createdAt: -1 });
  res.status(200).json({ documents: documents.map((d) => d.toSafeJSON()) });
});

// POST /api/admin/users/:id/documents  (multipart: file + name/category/status/version)
export const uploadEmployeeDocument = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) throw new AppError("Employee not found.", 404);
  if (!req.file) throw new AppError("No file was uploaded.", 400);

  const { name, category, status, version } = req.body;
  if (!name) throw new AppError("Document name is required.", 400);
  if (category && !DOCUMENT_CATEGORIES.includes(category)) throw new AppError("Invalid document category.", 400);
  if (status && !DOCUMENT_STATUSES.includes(status)) throw new AppError("Invalid document status.", 400);

  const document = await Document.create({
    employee: employee._id,
    uploadedBy: req.user._id,
    name,
    category: category || "Other Documents",
    status: status || "Available",
    version: version || "1.0",
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    fileData: req.file.buffer,
  });

  res.status(201).json({ document: document.toSafeJSON() });
});

// PATCH /api/admin/documents/:docId  (status/name/category/version, optionally
// with a replacement file — all fields optional/independent)
export const updateEmployeeDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.docId);
  if (!document) throw new AppError("Document not found.", 404);

  const { name, category, status, version } = req.body;

  if (status !== undefined) {
    if (!DOCUMENT_STATUSES.includes(status)) throw new AppError("Invalid document status.", 400);
    document.status = status;
  }
  if (category !== undefined) {
    if (!DOCUMENT_CATEGORIES.includes(category)) throw new AppError("Invalid document category.", 400);
    document.category = category;
  }
  if (name !== undefined) document.name = name;
  if (version !== undefined) document.version = version;

  if (req.file) {
    document.fileName = req.file.originalname;
    document.mimeType = req.file.mimetype;
    document.fileSize = req.file.size;
    document.fileData = req.file.buffer;
  }

  await document.save();
  res.status(200).json({ document: document.toSafeJSON() });
});
