import { Escrow } from "../models/escrowSchema.js";
import { Application } from "../models/applicationSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";

// ── Helper: sync escrowStatus back to Application ──────────────
const syncApplicationEscrowStatus = async (applicationId, status) => {
  await Application.findByIdAndUpdate(applicationId, { escrowStatus: status });
};

/* ════════════════════════════════════════
   CREATE ESCROW
   Employer initiates payment after accepting applicant.
   POST /api/v1/escrow/create
   Body: { applicationId, agreedAmount }
════════════════════════════════════════ */
export const createEscrow = catchAsyncErrors(async (req, res, next) => {
  const { applicationId, agreedAmount } = req.body;

  if (!applicationId || !agreedAmount) {
    return next(new ErrorHandler("Application ID and agreed amount are required", 400));
  }

  const application = await Application.findById(applicationId)
    .populate("jobId", "title")
    .populate("applicantID.user", "name")
    .populate("employerID.user", "name");

  if (!application) return next(new ErrorHandler("Application not found", 404));

  // Only employer can create escrow
  if (application.employerID.user._id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Only the employer can initiate payment", 403));
  }

  // Application must be accepted first
  if (application.status !== "Accepted") {
    return next(new ErrorHandler("You can only initiate payment for accepted applications", 400));
  }

  // Check if escrow already exists
  const existing = await Escrow.findOne({ applicationId });
  if (existing) {
    return next(new ErrorHandler("Payment has already been initiated for this application", 400));
  }

  const escrow = await Escrow.create({
    applicationId,
    jobId:      application.jobId._id,
    employerId: application.employerID.user._id,
    seekerId:   application.applicantID.user._id,
    agreedAmount: Number(agreedAmount),
  });

  // Update application escrow status
  await syncApplicationEscrowStatus(applicationId, "pending");
  application.agreedAmount = Number(agreedAmount);
  await application.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    message: "Payment initiated. Please complete M-Pesa payment.",
    escrow,
  });
});

/* ════════════════════════════════════════
   GET ESCROW BY APPLICATION
   GET /api/v1/escrow/:applicationId
════════════════════════════════════════ */
export const getEscrowByApplication = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;

  const escrow = await Escrow.findOne({ applicationId })
    .populate("employerId", "name email phone")
    .populate("seekerId",   "name email phone")
    .populate("jobId",      "title county category");

  if (!escrow) {
    return res.status(200).json({ success: true, escrow: null });
  }

  // Only employer, seeker, or admin can view
  const userId = req.user._id.toString();
  const isParty =
    escrow.employerId._id.toString() === userId ||
    escrow.seekerId._id.toString()   === userId ||
    req.user.role === "Admin";

  if (!isParty) return next(new ErrorHandler("Not authorized", 403));

  res.status(200).json({ success: true, escrow });
});

/* ════════════════════════════════════════
   SUBMIT MPESA REFERENCE
   Employer submits their M-Pesa transaction code after paying.
   PUT /api/v1/escrow/:applicationId/mpesa-reference
   Body: { mpesaReference }
════════════════════════════════════════ */
export const submitMpesaReference = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;
  const { mpesaReference } = req.body;

  if (!mpesaReference) return next(new ErrorHandler("M-Pesa reference is required", 400));

  const escrow = await Escrow.findOne({ applicationId });
  if (!escrow) return next(new ErrorHandler("Escrow not found", 404));

  if (escrow.employerId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Only the employer can submit payment reference", 403));
  }

  escrow.mpesaReference = mpesaReference.trim().toUpperCase();
  await escrow.save();

  res.status(200).json({
    success: true,
    message: "M-Pesa reference submitted. Awaiting admin confirmation.",
    escrow,
  });
});

/* ════════════════════════════════════════
   ADMIN: CONFIRM PAYMENT RECEIVED
   Admin confirms they received the M-Pesa payment.
   PUT /api/v1/escrow/:applicationId/confirm-payment
════════════════════════════════════════ */
export const confirmPayment = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;

  const escrow = await Escrow.findOne({ applicationId });
  if (!escrow) return next(new ErrorHandler("Escrow not found", 404));

  if (escrow.status !== "pending") {
    return next(new ErrorHandler(`Cannot confirm payment — current status is ${escrow.status}`, 400));
  }

  escrow.status             = "in_progress";
  escrow.paymentConfirmedAt = new Date();
  escrow.paymentConfirmedBy = req.user._id;
  await escrow.save();

  await syncApplicationEscrowStatus(applicationId, "in_progress");

  res.status(200).json({
    success: true,
    message: "Payment confirmed. Job is now In Progress.",
    escrow,
  });
});

/* ════════════════════════════════════════
   SEEKER: MARK WORK AS SUBMITTED
   Optional step — seeker says "I'm done, please review"
   PUT /api/v1/escrow/:applicationId/submit-work
════════════════════════════════════════ */
export const submitWork = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;

  const escrow = await Escrow.findOne({ applicationId });
  if (!escrow) return next(new ErrorHandler("Escrow not found", 404));

  if (escrow.seekerId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Only the job seeker can mark work as submitted", 403));
  }

  if (escrow.status !== "in_progress") {
    return next(new ErrorHandler("Work can only be submitted when job is in progress", 400));
  }

  escrow.status          = "work_submitted";
  escrow.workSubmittedAt = new Date();
  await escrow.save();

  await syncApplicationEscrowStatus(applicationId, "work_submitted");

  res.status(200).json({
    success: true,
    message: "Work marked as submitted. Awaiting employer confirmation.",
    escrow,
  });
});

/* ════════════════════════════════════════
   EMPLOYER: CONFIRM WORK DONE
   Starts the 3-day auto-release window.
   PUT /api/v1/escrow/:applicationId/confirm-completion
════════════════════════════════════════ */
export const confirmCompletion = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;

  const escrow = await Escrow.findOne({ applicationId });
  if (!escrow) return next(new ErrorHandler("Escrow not found", 404));

  if (escrow.employerId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Only the employer can confirm completion", 403));
  }

  if (!["in_progress", "work_submitted"].includes(escrow.status)) {
    return next(new ErrorHandler("Job must be in progress to confirm completion", 400));
  }

  const now           = new Date();
  const autoReleaseAt = new Date(now);
  autoReleaseAt.setDate(autoReleaseAt.getDate() + 3); // 3 days

  escrow.status        = "completed";
  escrow.completedAt   = now;
  escrow.autoReleaseAt = autoReleaseAt;
  await escrow.save();

  await syncApplicationEscrowStatus(applicationId, "completed");

  res.status(200).json({
    success: true,
    message: "Work confirmed. Funds will be released in 3 days if no dispute is filed.",
    escrow,
  });
});

/* ════════════════════════════════════════
   SEEKER: FILE A DISPUTE
   Must be filed before autoReleaseAt.
   PUT /api/v1/escrow/:applicationId/dispute
   Body: { disputeReason }
════════════════════════════════════════ */
export const fileDispute = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;
  const { disputeReason } = req.body;

  if (!disputeReason) return next(new ErrorHandler("Please provide a reason for your dispute", 400));

  const escrow = await Escrow.findOne({ applicationId });
  if (!escrow) return next(new ErrorHandler("Escrow not found", 404));

  if (escrow.seekerId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Only the job seeker can file a dispute", 403));
  }

  if (escrow.status !== "completed") {
    return next(new ErrorHandler("Disputes can only be filed after employer confirms completion", 400));
  }

  // Check if still within the 3-day window
  if (escrow.autoReleaseAt && new Date() > escrow.autoReleaseAt) {
    return next(new ErrorHandler("Dispute window has closed. Funds have already been auto-released.", 400));
  }

  escrow.status          = "disputed";
  escrow.disputeReason   = disputeReason;
  escrow.disputeFiledAt  = new Date();
  await escrow.save();

  await syncApplicationEscrowStatus(applicationId, "disputed");

  res.status(200).json({
    success: true,
    message: "Dispute filed. Admin will review and make a decision.",
    escrow,
  });
});

/* ════════════════════════════════════════
   ADMIN: RELEASE FUNDS TO SEEKER
   PUT /api/v1/escrow/:applicationId/release
   Body: { adminNotes } (optional)
════════════════════════════════════════ */
export const releaseFunds = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;
  const { adminNotes }    = req.body;

  const escrow = await Escrow.findOne({ applicationId })
    .populate("seekerId",   "name phone email")
    .populate("employerId", "name");

  if (!escrow) return next(new ErrorHandler("Escrow not found", 404));

  if (!["completed", "disputed"].includes(escrow.status)) {
    return next(new ErrorHandler(`Cannot release — status is ${escrow.status}`, 400));
  }

  escrow.status      = "released";
  escrow.releasedAt  = new Date();
  escrow.releasedBy  = req.user._id;
  if (adminNotes) escrow.adminNotes = adminNotes;
  if (escrow.disputeFiledAt) {
    escrow.disputeResolvedAt  = new Date();
    escrow.disputeResolvedBy  = req.user._id;
    escrow.disputeOutcome     = "released";
  }
  await escrow.save();

  await syncApplicationEscrowStatus(applicationId, "released");

  res.status(200).json({
    success: true,
    message: `Funds released. Transfer KES ${escrow.seekerPayout.toLocaleString()} to ${escrow.seekerId.name} (${escrow.seekerId.phone}).`,
    escrow,
    transferDetails: {
      name:   escrow.seekerId.name,
      phone:  escrow.seekerId.phone,
      email:  escrow.seekerId.email,
      amount: escrow.seekerPayout,
    },
  });
});

/* ════════════════════════════════════════
   ADMIN: REFUND EMPLOYER
   PUT /api/v1/escrow/:applicationId/refund
   Body: { adminNotes } (optional)
════════════════════════════════════════ */
export const refundEmployer = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;
  const { adminNotes }    = req.body;

  const escrow = await Escrow.findOne({ applicationId })
    .populate("employerId", "name phone email");

  if (!escrow) return next(new ErrorHandler("Escrow not found", 404));

  if (!["paid", "in_progress", "work_submitted", "completed", "disputed"].includes(escrow.status)) {
    return next(new ErrorHandler(`Cannot refund — status is ${escrow.status}`, 400));
  }

  escrow.status = "refunded";
  if (adminNotes) escrow.adminNotes = adminNotes;
  if (escrow.disputeFiledAt) {
    escrow.disputeResolvedAt = new Date();
    escrow.disputeResolvedBy = req.user._id;
    escrow.disputeOutcome    = "refunded";
  }
  await escrow.save();

  await syncApplicationEscrowStatus(applicationId, "refunded");

  res.status(200).json({
    success: true,
    message: `Refund issued. Transfer KES ${escrow.agreedAmount.toLocaleString()} back to ${escrow.employerId.name} (${escrow.employerId.phone}).`,
    escrow,
    transferDetails: {
      name:   escrow.employerId.name,
      phone:  escrow.employerId.phone,
      email:  escrow.employerId.email,
      amount: escrow.agreedAmount,
    },
  });
});

/* ════════════════════════════════════════
   ADMIN: GET ALL ESCROWS
   GET /api/v1/escrow/all
════════════════════════════════════════ */
export const getAllEscrows = catchAsyncErrors(async (req, res, next) => {
  const escrows = await Escrow.find()
    .populate("employerId", "name email phone")
    .populate("seekerId",   "name email phone")
    .populate("jobId",      "title county")
    .populate("applicationId", "status")
    .sort({ createdAt: -1 });

  // Summary stats for admin dashboard
  const stats = {
    total:       escrows.length,
    pending:     escrows.filter(e => e.status === "pending").length,
    inProgress:  escrows.filter(e => e.status === "in_progress").length,
    completed:   escrows.filter(e => e.status === "completed").length,
    disputed:    escrows.filter(e => e.status === "disputed").length,
    released:    escrows.filter(e => e.status === "released").length,
    refunded:    escrows.filter(e => e.status === "refunded").length,
    totalHeld:   escrows
      .filter(e => ["paid", "in_progress", "work_submitted", "completed"].includes(e.status))
      .reduce((sum, e) => sum + e.agreedAmount, 0),
    totalEarned: escrows
      .filter(e => e.status === "released")
      .reduce((sum, e) => sum + e.platformFee, 0),
  };

  res.status(200).json({ success: true, escrows, stats });
});

/* ════════════════════════════════════════
   AUTO-RELEASE CHECK
   Called by a cron job or manually triggered.
   Releases all escrows where autoReleaseAt has passed.
   POST /api/v1/escrow/auto-release
════════════════════════════════════════ */
export const processAutoReleases = catchAsyncErrors(async (req, res, next) => {
  const now = new Date();

  const dueForRelease = await Escrow.find({
    status:        "completed",
    autoReleaseAt: { $lte: now },
  }).populate("seekerId", "name phone email");

  let released = 0;

  for (const escrow of dueForRelease) {
    escrow.status     = "released";
    escrow.releasedAt = now;
    escrow.adminNotes = "Auto-released after 3-day window with no dispute.";
    await escrow.save();
    await syncApplicationEscrowStatus(escrow.applicationId.toString(), "released");
    released++;
  }

  res.status(200).json({
    success: true,
    message: `${released} escrow(s) auto-released.`,
    released,
  });
});
