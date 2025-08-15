import { User } from "../models/userSchema.js";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";

// GET: All users
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find()
    .select("name email phone role status")
    .lean();

  res.status(200).json({ success: true, users });
});

// PUT: Update user status (approve/block)
export const updateUserStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  user.status = status;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "User status updated", user });
});

// GET: All jobs
export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find()
    .populate("postedBy", "name email role")
    .select("title category status postedBy")
    .lean();

  res.status(200).json({ success: true, jobs });
});

// PUT: Update job status
export const updateJobStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const job = await Job.findById(id);
  if (!job) return next(new ErrorHandler("Job not found", 404));

  job.status = status;
  await job.save();

  res
    .status(200)
    .json({ success: true, message: "Job status updated", job });
});

// GET: All applications
export const adminGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const applications = await Application.find()
      .populate("applicantID.user", "name email role")
      .populate("employerID.user", "name email role")
      .populate("jobId", "title status")
      .lean();

    // Ensure paymentStatus always exists
    const formattedApps = applications.map((app) => ({
      ...app,
      paymentStatus: app.paymentStatus || "unpaid",
    }));

    res.status(200).json({ success: true, applications: formattedApps });
  }
);

// GET: Admin stats
export const getAdminStats = catchAsyncErrors(async (req, res, next) => {
  // Adjust these role filters based on your exact DB values
  const totalUsers = await User.countDocuments();
  const totalEmployers = await User.countDocuments({
    role: { $regex: /^employer$/i },
  });
  const totalJobSeekers = await User.countDocuments({
    role: { $regex: /^jobseeker$/i },
  });
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalEmployers,
      totalJobSeekers,
      totalJobs,
      totalApplications,
    },
  });
});
