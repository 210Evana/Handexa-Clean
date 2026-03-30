import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  jobInfo: {
    jobTitle: String,
    jobCounty: String,
    jobCategory: String,
  },
  applicantID: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: String,
    email: String,
    phone: Number,
    address: String,
    resume: {
      public_id: String,
      url: String,
    },
    coverLetter: String,
  },
  employerID: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: String,
    email: String,
    phone: Number,
    address: String,
  },

  // ── Application status ──────────────────────────────────────
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },

  // ── Escrow/payment status ───────────────────────────────────
  // Mirrors the escrow record status for quick UI queries
  // without having to join the Escrow collection every time.
  escrowStatus: {
    type: String,
    enum: [
      "none",           // no escrow created yet
      "pending",        // employer shown payment instructions
      "paid",           // admin confirmed payment
      "in_progress",    // work underway
      "work_submitted", // seeker marked work done
      "completed",      // employer confirmed completion
      "released",       // funds released to seeker
      "disputed",       // dispute filed
      "refunded",       // employer refunded
    ],
    default: "none",
  },

  // ── Agreed amount (set during chat/negotiation) ─────────────
  // Employer enters this when initiating payment
  agreedAmount: {
    type: Number,
    default: null,
  },

  deletedBy: {
    type: String,
    enum: ["employer", "jobSeeker", null],
    default: null,
  },
}, { timestamps: true });

export const Application = mongoose.model("Application", applicationSchema);
