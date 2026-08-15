import { AppError } from "../utils/AppError.js";

export function notFoundMiddleware(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// Every response body here is { message, code? } — exactly what the
// frontend's apiClient already expects from a non-2xx response.
export function errorMiddleware(err, req, res, next) {
  if (err.code === 11000) {
    // Mongo duplicate key (e.g. email already registered)
    return res.status(409).json({ message: "An account with this email already exists." });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors)[0]?.message || "Invalid input." });
  }

  const statusCode = err instanceof AppError ? err.statusCode : err.statusCode || 500;
  if (statusCode >= 500) {
    console.error(err);
  }
  res.status(statusCode).json({
    message: err.message || "Something went wrong. Please try again.",
    ...(err.code ? { code: err.code } : {}),
  });
}
