import ErrorHandler from "./error.js";
import { catchAsyncErrors } from "./catchAsyncError.js";

/**
 * checkPremium middleware
 *
 * Use on any route that requires premium access.
 * Admin always passes. Free users get a 403 with a clear message.
 *
 * Usage in router:
 *   router.get("/messages/:id", isAuthorized, checkPremium, getMessages);
 */
export const checkPremium = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;

  // Admin bypasses all premium checks
  if (user.role === "Admin") return next();

  // Check isPremium flag
  if (!user.isPremium) {
    return next(
      new ErrorHandler(
        "This feature requires a Premium account. Upgrade to access messaging and contact details.",
        403
      )
    );
  }

  // Check expiry
  if (user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
    // Auto-clear expired premium
    user.isPremium          = false;
    user.premiumExpiresAt   = null;
    user.premiumGrantedBy   = null;
    await user.save({ validateBeforeSave: false });

    return next(
      new ErrorHandler(
        "Your Premium subscription has expired. Please renew to continue using premium features.",
        403
      )
    );
  }

  next();
});
