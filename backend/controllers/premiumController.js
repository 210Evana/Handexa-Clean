import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";

/**
 * Grant premium to a user
 * POST /api/v1/admin/users/:id/premium
 * Body: { durationDays: 30 }  — omit or send 0 for lifetime
 */
export const grantPremium = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { durationDays } = req.body; // optional — 0 or missing = lifetime

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  user.isPremium        = true;
  user.premiumGrantedBy = "admin";
  user.premiumGrantedAt = new Date();

  if (durationDays && durationDays > 0) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + Number(durationDays));
    user.premiumExpiresAt = expiry;
  } else {
    user.premiumExpiresAt = null; // lifetime
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `Premium granted to ${user.name}${durationDays ? ` for ${durationDays} days` : " (lifetime)"}`,
    user: {
      _id:              user._id,
      name:             user.name,
      isPremium:        user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
    },
  });
});

/**
 * Revoke premium from a user
 * DELETE /api/v1/admin/users/:id/premium
 */
export const revokePremium = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  user.isPremium        = false;
  user.premiumExpiresAt = null;
  user.premiumGrantedBy = null;
  user.premiumGrantedAt = null;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `Premium revoked from ${user.name}`,
  });
});
