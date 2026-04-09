import express from "express";
import {
  postApplication,
  jobseekerGetAllApplications,
  employerGetAllApplications,
  jobseekerDeleteApplication,
  updateApplicationStatus,
  getApplicationById,
  getTodayApplicationCount,
} from "../controllers/applicationController.js";
import { isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post",                          isAuthorized, postApplication);
router.get("/jobseeker/getall",               isAuthorized, jobseekerGetAllApplications);
router.get("/employer/getall",                isAuthorized, employerGetAllApplications);
router.delete("/delete/:id",                  isAuthorized, jobseekerDeleteApplication);
router.put("/status/:applicationId",          isAuthorized, updateApplicationStatus);
router.get("/today-count",                    isAuthorized, getTodayApplicationCount);
router.get("/:applicationId",                 isAuthorized, getApplicationById);

export default router;
