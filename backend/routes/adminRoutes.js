import express from "express";
import {
  getAllUsers,
  updateUserStatus,
  getAllJobs,
  updateJobStatus,
  adminGetAllApplications,
  getAdminStats,
} from "../controllers/adminController.js";
import {
  grantPremium,
  revokePremium,
} from "../controllers/premiumController.js";
import { isAuthorized, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/users",                  isAuthorized, isAdmin, getAllUsers);
router.put("/users/:id/status",       isAuthorized, isAdmin, updateUserStatus);
router.get("/jobs",                   isAuthorized, isAdmin, getAllJobs);
router.put("/jobs/:id/status",        isAuthorized, isAdmin, updateJobStatus);
router.get("/applications",           isAuthorized, isAdmin, adminGetAllApplications);
router.get("/stats",                  isAuthorized, isAdmin, getAdminStats);

// ── Premium management ──────────────────────────────────────────
router.post("/users/:id/premium",     isAuthorized, isAdmin, grantPremium);
router.delete("/users/:id/premium",   isAuthorized, isAdmin, revokePremium);

export default router;
