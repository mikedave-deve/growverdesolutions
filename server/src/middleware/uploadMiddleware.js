import multer from "multer";
import { AppError } from "../utils/AppError.js";

const MAX_AVATAR_MB = 3;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const singlePhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new AppError("Unsupported image type. Use JPG, PNG, or WEBP.", 400));
    }
    cb(null, true);
  },
}).single("photo");

// multer's own errors (e.g. LIMIT_FILE_SIZE) aren't AppErrors, so this
// normalizes them into the same { message } shape errorMiddleware
// already returns for everything else, instead of a generic 500.
export function avatarUpload(req, res, next) {
  singlePhoto(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError(`Image is too large. Maximum size is ${MAX_AVATAR_MB}MB.`, 400));
    }
    next(err instanceof AppError ? err : new AppError(err.message || "Upload failed.", 400));
  });
}

// Employee documents: admin can upload any file type (offer letters,
// contracts, scanned handbooks, etc.), so there's no fileFilter here —
// only a size cap. Files are stored directly on the Document document
// in MongoDB, which has a hard 16MB-per-document limit, so this is
// capped well under that.
const MAX_DOCUMENT_MB = 8;

const singleDocumentFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_MB * 1024 * 1024 },
}).single("file");

export function documentUpload(req, res, next) {
  singleDocumentFile(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError(`File is too large. Maximum size is ${MAX_DOCUMENT_MB}MB.`, 400));
    }
    next(err instanceof AppError ? err : new AppError(err.message || "Upload failed.", 400));
  });
}

// Identity verification: front/back of a government ID — same accepted
// types and size cap as the frontend's FileUpload dropzone for this page.
const MAX_ID_FILE_MB = 10;
const ID_ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];

const verificationFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_ID_FILE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ID_ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new AppError("Unsupported file type. Use PDF, JPG, or PNG.", 400));
    }
    cb(null, true);
  },
}).fields([{ name: "front", maxCount: 1 }, { name: "back", maxCount: 1 }]);

export function verificationUpload(req, res, next) {
  verificationFiles(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError(`File is too large. Maximum size is ${MAX_ID_FILE_MB}MB.`, 400));
    }
    next(err instanceof AppError ? err : new AppError(err.message || "Upload failed.", 400));
  });
}

// Shipment package photo — optional on both create and edit.
const MAX_SHIPMENT_PHOTO_MB = 5;

const singleShipmentPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SHIPMENT_PHOTO_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new AppError("Unsupported image type. Use JPG, PNG, or WEBP.", 400));
    }
    cb(null, true);
  },
}).single("photo");

export function shipmentPhotoUpload(req, res, next) {
  singleShipmentPhoto(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError(`Image is too large. Maximum size is ${MAX_SHIPMENT_PHOTO_MB}MB.`, 400));
    }
    next(err instanceof AppError ? err : new AppError(err.message || "Upload failed.", 400));
  });
}

// Public careers "Submit Your Resume" form — accepts any file type
// (resumes come as PDF, DOC, DOCX, and sometimes others), no auth
// required, so this is the only upload path with no signed-in user.
const MAX_RESUME_MB = 10;

const singleResumeFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_MB * 1024 * 1024 },
}).single("resume");

export function resumeUpload(req, res, next) {
  singleResumeFile(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError(`File is too large. Maximum size is ${MAX_RESUME_MB}MB.`, 400));
    }
    next(err instanceof AppError ? err : new AppError(err.message || "Upload failed.", 400));
  });
}
