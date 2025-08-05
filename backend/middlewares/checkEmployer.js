// middlewares/checkEmployer.js
import ErrorHandler from "../utils/error.js";

export const checkEmployer = (req, res, next) => {
  if (req.user.role !== "Employer") {
    return next(new ErrorHandler("Only employers can perform this action", 403));
  }
  next();
};
// This middleware checks if the user is an employer before allowing them to post a job.
// If the user is not an employer, it returns a 403 Forbidden error with a message indicating that only employers can perform this action.
// This is useful for protecting routes that should only be accessible to employers, such as job posting