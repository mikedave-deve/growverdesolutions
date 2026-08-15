// A thrown error with an HTTP status attached. errorMiddleware turns
// this into the { message } JSON body the frontend's apiClient
// already expects.
export class AppError extends Error {
  constructor(message, statusCode = 400, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code; // optional machine-readable code, e.g. "PENDING_APPROVAL"
  }
}
