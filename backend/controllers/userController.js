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
  
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });
  sendToken(user, 201, res, "User Registered!");
});


export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email ,password and role."));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }

if (user.role!== role)
{
    return next(
      new ErrorHandler(`User with this this email and ${role} not found!`, 404)
    );
  }
  sendToken(user, 201, res, "User Logged In!");
});


export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      secure:true,
      sameSite: "None",
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully.",
    });
});


export const getUser = catchAsyncErrors((req, res, next) => {
  const user =req.user;
  //if (!user) return next(new ErrorHandler("User not found!", 404));
    res.status(200).json({
    success: true,
    user,
  });
});

export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  const { name, email, phone } = req.body;

  // Validate email uniqueness (if changed)
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(new ErrorHandler("Email already registered!", 400));
    }
  }

  // Validate phone uniqueness (if changed)
  if (phone && phone !== user.phone) {
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return next(new ErrorHandler("Phone number already registered!", 400));
    }
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;

  if (req.body.avatar) {
    // Delete previous avatar from Cloudinary if it exists
    if (user.avatar?.public_id) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }
    // Upload new avatar
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
    });
    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});