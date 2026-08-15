import { AppError } from "../utils/AppError.js";
import { readSessionCookie, verifyToken } from "../utils/token.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Populates req.user from the httpOnly session cookie. Used by any
// route that requires the caller to be signed in.
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = readSessionCookie(req);
  if (!token) throw new AppError("You must be signed in.", 401);

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError("Your session has expired. Please sign in again.", 401);
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new AppError("Your session is no longer valid.", 401);

  req.user = user;
  next();
});

// Restricts a route to specific roles — used for the admin-approval
// endpoints. Layer this after requireAuth.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You don't have permission to do that.", 403));
    }
    next();
  };
}
