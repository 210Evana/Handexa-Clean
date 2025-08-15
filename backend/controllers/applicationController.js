import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";
//import mongoose from "mongoose";

// Job Seeker applies for a job
export const postApplication = catchAsyncErrors(async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role === "Employer") {
      return next(new ErrorHandler("Employers not allowed to apply for jobs.", 400));
    }

    const { name, email, coverLetter, phone, address, jobId } = req.body;

    if (!name || !email || !coverLetter || !phone || !address || !jobId) {
      return next(new ErrorHandler("Please fill in all required fields, including cover letter and job ID.", 400));
    }

    const jobDetails = await Job.findById(jobId);
    if (!jobDetails) {
      return next(new ErrorHandler("Job not found!", 404));
    }

    let resumeData = null;
    if (req.files && req.files.resume) {
      const resume = req.files.resume;
      const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
      if (!allowedFormats.includes(resume.mimetype)) {
        return next(
          new ErrorHandler("Invalid file type. Only PNG, JPEG, or WEBP allowed.", 400)
        );
      }
      const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath);
      if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary error");
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
      applicantID: {
        user: req.user._id,
        role: "Job Seeker",
      },
      employerID: {
        user: jobDetails.postedBy,
        role: "Employer",
      },
      //jobId, //add jobId
    });

    res.status(200).json({
      success: true,
      message: "Application Submitted!",
      application,
    });
   /*} catch (error) {
    console.error("Error in postApplication:", error.stack);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return next(new ErrorHandler(`Validation failed: ${messages.join(", ")}`, 400));
    }
    return next(new ErrorHandler(`Failed to submit application: ${error.message}`, 500));
  }*/
});

// Job Seeker views their applications
export const jobseekerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role === "Employer") {
      return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
    }
    console.log("Fetching applications for job seeker:", req.user._id);
    const applications = await Application.find({ "applicantID.user": req.user._id })
      .populate({ path: "jobId", select: "title company location" })
      .populate({ path: "applicantID.user", select: "name email phone" })
      .populate({ path: "employerID.user", select: "name email" });
    console.log("Applications fetched:", applications.length);
    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Error in jobseekerGetAllApplications:", error.stack);
    return next(new ErrorHandler(`Failed to fetch applications: ${error.message}`, 500));
  }
});

// Employer views all applications
export const employerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "Employer") {
      return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
    }
    const applications = await Application.find({
      "employerID.user": req.user._id,
    })
      .populate({
        path: "jobId",
        select: "title category county location",
      })
      .populate("applicantID.user", "name email");
    console.log(
      "Applications with IDs:",
      applications.map((app) => ({
        _id: app._id,
        jobId: app.jobId,
        applicantID: app.applicantID,
        employerID: app.employerID,
      }))
    );
    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Error in employerGetAllApplications:", error.stack);
    return next(new ErrorHandler(`Failed to fetch applications: ${error.message}`, 500));
  }
});

// Job Seeker deletes an application
export const jobseekerDeleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }
 const { _id } = req.user;
  const application = await Application.findById(req.params.id);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }
  await application.deleteOne();
  res.status(200).json({
    success: true,
    message: "Application Deleted!",
  });
});

// Employer updates application status
export const updateApplicationStatus = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "Employer") {
    return next(new ErrorHandler("Job Seeker not allowed to update status", 403));
  }

  const { id } = req.params; // Changed from applicationId to id for consistency
  const { status } = req.body;
  if (!["pending", "accepted", "rejected"].includes(status)) {
    return next(new ErrorHandler("Invalid status value", 400));
  }

  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found", 404));
  }

  // Restrict to the employer who owns this application
  if (application.employerID.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to update this application", 403));
  }

  application.status = status;
  await application.save();

  // Initiate payment for "accepted" status
  if (status === "accepted") {
    try {
      // Placeholder for payment initiation
      // TODO: Integrate with Stripe/PayPal API
      console.log(`Payment initiation placeholder for application ${id}`);
      // Example: Add payment intent logic here
      // const paymentIntent = await stripe.paymentIntents.create({ amount: job.salary * 100, currency: "usd" });
      // application.paymentIntentId = paymentIntent.id;
      // await application.save();
      res.status(200).json({
        success: true,
        message: "Application status updated and payment initiated (placeholder)",
        application,
      });
    } catch (error) {
      return next(new ErrorHandler("Failed to initiate payment: " + error.message, 500));
    }
  } else {
    res.status(200).json({
      success: true,
      message: "Application status updated",
      application,
    });
  }
});
// Get application by ID
export const getApplicationById = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;
  
  const application = await Application.findById(applicationId)
    .populate("applicantID.user", "name email role") // Updated to match schema
    .populate("employerID.user", "name email role")
    .populate("job", "title status");
  if (!application) return next(new ErrorHandler("Application not found", 404));
  if( application.user._id.toString() !== req.user._id.toString() &&
      application.job.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to view this application", 403));
  }
  res.status(200).json({ success: true, application });
});