import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

// Middleware to check if user is authenticated and optionally restrict by role
export const isAuthorized = (allowedRoles = []) => catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Unauthorized: No token provided", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id).select("+role");

    if (!req.user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // If specific roles are provided, check if the user's role is allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(new ErrorHandler(`Access denied: Only ${allowedRoles.join(" or ")} can access this resource`, 403));
    }

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Unauthorized: Token has expired", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Unauthorized: Invalid token", 401));
    }
    return next(new ErrorHandler("Authentication failed", 401));
  }
});

export const isAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("Unauthorized: No user data found", 401));
  }
  if (req.user.role !== "Admin") {
    return next(new ErrorHandler("Access denied: Only Admins can access this resource", 403));
  }
  next();
});