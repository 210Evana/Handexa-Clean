import express from "express";
import {
  deleteJob,
  getAllJobs,
  getMyJobs,
  getSingleJob,
  postJob,
  updateJob,
} from "../controllers/jobController.js";
import { isAuthorized } from "../middlewares/auth.js";

console.log("getAllJobs:", getAllJobs); // Debug log

const router = express.Router();

router.get("/getall", isAuthorized(["Job Seeker", "Employer"]), getAllJobs);
router.post("/post", isAuthorized(["Employer"]), postJob);
router.get("/getmyjobs", isAuthorized(["Employer"]), getMyJobs);
router.put("/update/:id", isAuthorized(["Employer"]), updateJob);
router.delete("/delete/:id", isAuthorized(["Employer"]), deleteJob);
router.get("/:id", isAuthorized(["Job Seeker", "Employer"]), getSingleJob);

export default router;