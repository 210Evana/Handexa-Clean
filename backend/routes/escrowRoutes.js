import express from "express";
import { isAuthorized, isAdmin } from "../middlewares/auth.js";
import {
  createEscrow,
  getEscrowByApplication,
  submitMpesaReference,
  confirmPayment,
  submitWork,
  confirmCompletion,
  fileDispute,
  releaseFunds,
  refundEmployer,
  getAllEscrows,
  processAutoReleases,
} from "../controllers/escrowController.js";

const router = express.Router();

// ── Employer actions ───────────────────────────────────────────
router.post("/create",                              isAuthorized, createEscrow);
router.put("/:applicationId/mpesa-reference",       isAuthorized, submitMpesaReference);
router.put("/:applicationId/confirm-completion",    isAuthorized, confirmCompletion);

// ── Seeker actions ─────────────────────────────────────────────
router.put("/:applicationId/submit-work",           isAuthorized, submitWork);
router.put("/:applicationId/dispute",               isAuthorized, fileDispute);

// ── Shared (employer + seeker) ─────────────────────────────────
router.get("/:applicationId",                       isAuthorized, getEscrowByApplication);

// ── Admin only ─────────────────────────────────────────────────
router.get("/admin/all",                            isAuthorized, isAdmin, getAllEscrows);
router.put("/:applicationId/confirm-payment",       isAuthorized, isAdmin, confirmPayment);
router.put("/:applicationId/release",               isAuthorized, isAdmin, releaseFunds);
router.put("/:applicationId/refund",                isAuthorized, isAdmin, refundEmployer);
router.post("/admin/auto-release",                  isAuthorized, isAdmin, processAutoReleases);

export default router;
