import express from "express";
import {
  deleteJob, getAllJobs, getMyJobs, getSingleJob,
  postJob, updateJob, getMyJobCount,
} from "../controllers/jobController.js";
import { isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.get("/getall",          isAuthorized, getAllJobs);
router.post("/post",           isAuthorized, postJob);
router.get("/getmyjobs",       isAuthorized, getMyJobs);
router.get("/my-count",        isAuthorized, getMyJobCount);
router.put("/update/:id",      isAuthorized, updateJob);
router.delete("/delete/:id",   isAuthorized, deleteJob);
router.get("/:id",             isAuthorized, getSingleJob);

export default router;
