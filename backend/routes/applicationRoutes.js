import express from "express";
import {
  employerGetAllApplications,
  jobseekerDeleteApplication,
  jobseekerGetAllApplications,
  postApplication,
  updateApplicationStatus,
  getApplicationById,
} from "../controllers/applicationController.js";
import { isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

// Restrict to Job Seeker
router.post("/post", isAuthorized(["Job Seeker"]), postApplication);
router.get("/jobseeker/getall", isAuthorized(["Job Seeker"]), jobseekerGetAllApplications);
router.delete("/delete/:id", isAuthorized(["Job Seeker"]), jobseekerDeleteApplication);

// Restrict to Employer
router.get("/employer/getall", isAuthorized(["Employer"]), employerGetAllApplications);
router.put("/status/:applicationId", isAuthorized(["Employer"]), updateApplicationStatus);

// Allow both Job Seeker and Employer
router.get("/:applicationId", isAuthorized(["Job Seeker", "Employer"]), getApplicationById);

export default router;