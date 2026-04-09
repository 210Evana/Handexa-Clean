import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";
import { Escrow } from "../models/escrowSchema.js";
import ErrorHandler from "../middlewares/error.js";

/* ─── Helper: is user active premium? ─── */
const isActivePremium = (user) => {
  if (user.role === "Admin") return true;
  if (!user.isPremium) return false;
  if (!user.premiumExpiresAt) return true;
  return new Date(user.premiumExpiresAt) > new Date();
};

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find({ expired: false }).populate("postedBy", "name email county isPremium");

  // Premium employer jobs appear first
  const sorted = [
    ...jobs.filter((j) => j.postedBy?.isPremium),
    ...jobs.filter((j) => !j.postedBy?.isPremium),
  ];

  res.status(200).json({ success: true, jobs: sorted });
});

export const postJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
  }

  // ── FREE EMPLOYER: limit 2 active jobs ────────────────────────
  if (!isActivePremium(req.user)) {
    const activeCount = await Job.countDocuments({
      postedBy: req.user._id,
      expired: false,
    });

    if (activeCount >= 2) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        message: "Free accounts can only have 2 active jobs. Upgrade to Premium for unlimited job postings.",
        activeCount,
        limit: 2,
      });
    }
  }

  const { title, description, category, county, location, fixedSalary, salaryFrom, salaryTo } = req.body;

  if (!title || !description || !category || !county || !location) {
    return next(new ErrorHandler("Please provide full job details.", 400));
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return next(new ErrorHandler("Please either provide fixed salary or ranged salary.", 400));
  }

  if (salaryFrom && salaryTo && fixedSalary) {
    return next(new ErrorHandler("Cannot Enter Fixed and Ranged Salary together.", 400));
  }

  const job = await Job.create({
    title, description, category, county, location,
    fixedSalary, salaryFrom, salaryTo,
    postedBy: req.user._id,
  });

  // Return remaining slots for free employers
  const remaining = isActivePremium(req.user) ? null : Math.max(0, 2 - (
    await Job.countDocuments({ postedBy: req.user._id, expired: false })
  ));

  res.status(200).json({
    success: true,
    message: "Job Posted Successfully!",
    job,
    remaining,
  });
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
  }

  const myJobs = await Job.find({ postedBy: req.user._id });

  // Include remaining slots info for free employers
  const activeCount = myJobs.filter((j) => !j.expired).length;
  const remaining   = isActivePremium(req.user) ? null : Math.max(0, 2 - activeCount);

  res.status(200).json({ success: true, myJobs, remaining });
});

export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
  }

  const { id } = req.params;
  let job = await Job.findById(id);
  if (!job) return next(new ErrorHandler("OOPS! Job not found.", 404));

  job = await Job.findByIdAndUpdate(id, req.body, {
    new: true, runValidators: true, useFindAndModify: false,
  });

  res.status(200).json({ success: true, message: "Job Updated!" });
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
  }

  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) return next(new ErrorHandler("OOPS! Job not found.", 404));

  // Cascade delete applications + escrows
  const applications  = await Application.find({ jobId: id });
  const applicationIds = applications.map((a) => a._id);

  if (applicationIds.length > 0) {
    await Escrow.deleteMany({ applicationId: { $in: applicationIds } });
    await Application.deleteMany({ jobId: id });
  }

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: "Job and all related applications deleted successfully.",
  });
});

export const getSingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id).populate("postedBy", "name email county");
    if (!job) return next(new ErrorHandler("Job not found.", 404));
    res.status(200).json({ success: true, job });
  } catch (error) {
    return next(new ErrorHandler("Invalid ID / CastError", 404));
  }
});

// Get active job count for the logged-in employer
export const getMyJobCount = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "Employer") {
    return res.status(200).json({ success: true, activeCount: 0, limit: null, remaining: null });
  }

  const activeCount = await Job.countDocuments({ postedBy: req.user._id, expired: false });
  const premium     = isActivePremium(req.user);
  const limit       = premium ? null : 2;
  const remaining   = premium ? null : Math.max(0, 2 - activeCount);

  res.status(200).json({ success: true, activeCount, limit, remaining, isPremium: premium });
});
