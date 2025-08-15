import { User } from "../models/userSchema.js"; 
import { Job } from "../models/jobSchema.js";
 import { Application } from "../models/applicationSchema.js"; 
 import { catchAsyncErrors } from "../middlewares/catchAsyncError.js"; 
 import ErrorHandler from "../middlewares/error.js";

export const getAllUsers = catchAsyncErrors(async (req, res, next) => { 
    const users = await User.find().select("name email role status"); 
    res.status(200).json({ success: true, users }); });

export const updateUserStatus = catchAsyncErrors(async (req, res, next) => {
     const { id } = req.params; 
     const { status } = req.body; 
     const user = await User.findById(id); 
     if (!user) return next(new ErrorHandler("User not found", 404)); 
     user.status = status; await user.save(); 
     res.status(200).json({ success: true, message: "User status updated", user }); });

export const getAllJobs = catchAsyncErrors(async (req, res, next) => { const jobs = await Job.find().populate("postedBy", "name email role"); res.status(200).json({ success: true, jobs }); });

export const updateJobStatus = catchAsyncErrors(async (req, res, next) => { const { id } = req.params; const { status } = req.body; const job = await Job.findById(id); if (!job) return next(new ErrorHandler("Job not found", 404)); job.status = status; await job.save(); res.status(200).json({ success: true, message: "Job status updated", job }); });


export const adminGetAllApplications = catchAsyncErrors(async (req, res, next) => { 
    const applications = await Application.find() 
    .populate("applicantID.user", "name email role") 
    .populate("employerID.user", "name email role") .populate("job", "title status");

res.status(200).json({ success: true, application: applications }); });


export const getAdminStats = catchAsyncErrors(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalEmployers = await User.countDocuments({ role: "employer" });
  const totalJobSeekers = await User.countDocuments({ role: "jobseeker" });
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
