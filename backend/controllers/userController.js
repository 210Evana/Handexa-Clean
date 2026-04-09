import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full registration form!"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }
  const user = await User.create({ name, email, phone, password, role });
  sendToken(user, 201, res, "User Registered!");
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password and role."));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with this email and ${role} not found!`, 404)
    );
  }
  sendToken(user, 201, res, "User Logged In!");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(Date.now()),
    })
    .json({ success: true, message: "Logged Out Successfully." });
});

export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  res.status(200).json({ success: true, user });
});

/* ════════════════════════════════════════
   UPDATE USER PROFILE
   PUT /api/v1/user/profile
   Handles: name, email, phone, address,
            coverLetter, niches, resume upload
════════════════════════════════════════ */
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  const {
    name,
    email,
    phone,
    address,
    coverLetter,
    firstNiche,
    secondNiche,
    thirdNiche,
  } = req.body;

  // ── Email uniqueness check ──
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(new ErrorHandler("Email already registered!", 400));
    }
  }

  // ── Phone uniqueness check ──
  if (phone && phone.toString() !== user.phone?.toString()) {
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return next(new ErrorHandler("Phone number already registered!", 400));
    }
  }

  // ── Update basic fields ──
  if (name)        user.name        = name;
  if (email)       user.email       = email;
  if (phone)       user.phone       = phone;
  if (address)     user.address     = address;
  if (coverLetter !== undefined) user.coverLetter = coverLetter;

  // ── Update niches (job seeker only) ──
  if (user.role === "Job Seeker") {
    if (firstNiche  !== undefined) user.niches.firstNiche  = firstNiche;
    if (secondNiche !== undefined) user.niches.secondNiche = secondNiche;
    if (thirdNiche  !== undefined) user.niches.thirdNiche  = thirdNiche;
  }

  // ── Password change (optional) ────────────────────────────────
  if (req.body.currentPassword && req.body.newPassword) {
    // Re-fetch with password field (it has select:false)
    const userWithPwd = await User.findById(req.user._id).select("+password");
    const isMatch = await userWithPwd.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return next(new ErrorHandler("Current password is incorrect", 400));
    }
    user.password = req.body.newPassword;
  }

  // ── Resume / profile image upload ──
  if (req.files?.resume) {
    const resumeFile = req.files.resume;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(resumeFile.mimetype)) {
      return next(
        new ErrorHandler("Invalid file type. Only PNG, JPEG, WEBP allowed.", 400)
      );
    }
    // Delete old resume from Cloudinary
    if (user.resume?.public_id) {
      await cloudinary.v2.uploader.destroy(user.resume.public_id);
    }
    const uploaded = await cloudinary.v2.uploader.upload(
      resumeFile.tempFilePath
    );
    user.resume = {
      public_id: uploaded.public_id,
      url:       uploaded.secure_url,
    };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully!",
    user,
  });
});
