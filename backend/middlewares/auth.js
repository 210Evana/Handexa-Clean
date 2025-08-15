import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthorized = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) 
    return next(new ErrorHandler("User Not Authorized", 401));
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decoded.id).select("+role");
  if (!req.user)
    return next(new ErrorHandler("User Not Found", 404));
  

  next();
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


  

export const isAdmin = (req, res, next) => { 
  if (req.user.role !== "Admin") 
     return next(new ErrorHandler("Only Admins can access this resource", 403));
     next(); 
    };