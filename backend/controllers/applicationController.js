import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

/* ─── Helper: is user active premium? ─── */
const isActivePremium = (user) => {
  if (user.role === "Admin") return true;
  if (!user.isPremium) return false;
  if (!user.premiumExpiresAt) return true;
  return new Date(user.premiumExpiresAt) > new Date();
};

// Job Seeker applies for a job
export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(new ErrorHandler("Employers not allowed to apply for jobs.", 400));
  }

  // ── FREE SEEKER: limit 3 applications per day ──────────────────
  if (!isActivePremium(req.user)) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await Application.countDocuments({
      "applicantID.user": req.user._id,
      createdAt: { $gte: startOfDay },
    });

    if (todayCount >= 3) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        message: "Free accounts can only apply to 3 jobs per day. Upgrade to Premium for unlimited applications.",
        todayCount,
        limit: 3,
      });
    }
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;
  if (!name || !email || !coverLetter || !phone || !address || !jobId) {
    return next(new ErrorHandler("Please fill in all required fields.", 400));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  // Check if already applied
  const alreadyApplied = await Application.findOne({
    "applicantID.user": req.user._id,
    jobId,
  });
  if (alreadyApplied) {
    return next(new ErrorHandler("You have already applied for this job.", 400));
  }

  let resumeData = null;
  if (req.files?.resume) {
    const resume = req.files.resume;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(resume.mimetype)) {
      return next(new ErrorHandler("Invalid file type. Only PNG, JPEG, or WEBP allowed.", 400));
    }
    const cloudinaryResponse = await cloudinary.v2.uploader.upload(resume.tempFilePath);
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
    }
    resumeData = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  const application = await Application.create({
    name,
    email,
    phone,
    address,
    coverLetter,
    resume: resumeData,
    applicantID: { user: req.user._id, role: "Job Seeker" },
    employerID:  { user: jobDetails.postedBy, role: "Employer" },
    jobId,
  });

  // Return remaining applications for today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayCount = await Application.countDocuments({
    "applicantID.user": req.user._id,
    createdAt: { $gte: startOfDay },
  });

  const remaining = isActivePremium(req.user) ? null : Math.max(0, 3 - todayCount);

  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
    remaining, // null = premium (unlimited), number = free remaining today
  });
});

// Job Seeker views their applications
export const jobseekerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role === "Employer") {
    return next(new ErrorHandler("Employers cannot access this resource.", 400));
  }

  const applications = await Application.find({ "applicantID.user": req.user._id })
    .populate({ path: "jobId", select: "title company location county" })
    .populate({ path: "applicantID.user", select: "name email phone" })
    .populate({ path: "employerID.user", select: "name email" });

  // Filter out applications where job was deleted
  const valid = applications.filter((a) => a.jobId !== null && a.jobId !== undefined);

  res.status(200).json({ success: true, applications: valid });
});

// Employer views all applications
export const employerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "Employer") {
    return next(new ErrorHandler("Job Seekers cannot access this resource.", 400));
  }

  const applications = await Application.find({ "employerID.user": req.user._id })
    .populate({ path: "jobId", select: "title category county location" })
    .populate("applicantID.user", "name email");

  const valid = applications.filter((a) => a.jobId !== null && a.jobId !== undefined);

  res.status(200).json({ success: true, applications: valid });
});

// Job Seeker deletes an application
export const jobseekerDeleteApplication = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role === "Employer") {
    return next(new ErrorHandler("Employers cannot access this resource.", 400));
  }

  const application = await Application.findById(req.params.id);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  if (application.applicantID.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to delete this application", 403));
  }

  await application.deleteOne();
  res.status(200).json({ success: true, message: "Application Deleted!" });
});

// Employer updates application status
export const updateApplicationStatus = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "Employer") {
    return next(new ErrorHandler("Job Seekers cannot update status", 403));
  }

  const { applicationId } = req.params;
  const { status } = req.body;

  if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
    return next(new ErrorHandler("Invalid application ID", 400));
  }
  if (!status) {
    return next(new ErrorHandler("Status is required", 400));
  }

  const normalise = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const normalisedStatus = normalise(status);

  if (!["Pending", "Accepted", "Rejected"].includes(normalisedStatus)) {
    return next(new ErrorHandler("Invalid status value", 400));
  }

  const application = await Application.findById(applicationId);
  if (!application) {
    return next(new ErrorHandler("Application not found", 404));
  }

  if (application.employerID.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to update this application", 403));
  }

  application.status = normalisedStatus;
  await application.save();

  res.status(200).json({
    success: true,
    message: `Application status updated to ${normalisedStatus}`,
    application,
  });
});

// Get application by ID
export const getApplicationById = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;

  const application = await Application.findById(applicationId)
    .populate({ path: "jobId", select: "title county location" })
    .populate({ path: "applicantID.user", select: "name email role" })
    .populate({ path: "employerID.user", select: "name email role" });

  if (!application) {
    return next(new ErrorHandler("Application not found", 404));
  }

  if (
    application.applicantID.user._id.toString() !== req.user._id.toString() &&
    application.employerID.user._id.toString() !== req.user._id.toString()
  ) {
    return next(new ErrorHandler("Not authorized to view this application", 403));
  }

  res.status(200).json({ success: true, application });
});

// Get today's application count for the logged-in seeker
export const getTodayApplicationCount = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "Job Seeker") {
    return res.status(200).json({ success: true, todayCount: 0, limit: null, remaining: null });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await Application.countDocuments({
    "applicantID.user": req.user._id,
    createdAt: { $gte: startOfDay },
  });

  const premium   = isActivePremium(req.user);
  const limit     = premium ? null : 3;
  const remaining = premium ? null : Math.max(0, 3 - todayCount);

  res.status(200).json({ success: true, todayCount, limit, remaining, isPremium: premium });
});
