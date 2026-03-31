import mongoose from "mongoose";

const escrowSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true, // one escrow per application
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Amounts ────────────────────────────────────────────────
    agreedAmount: {
      type: Number,
      required: true,
      min: [100, "Amount must be at least KES 100"],
    },
    platformFeePercent: {
      type: Number,
      default: 5, // 5% platform cut
    },
    platformFee: {
      type: Number, // calculated: agreedAmount * 0.05
    },
    seekerPayout: {
      type: Number, // calculated: agreedAmount - platformFee
    },

    // ── Payment Status ─────────────────────────────────────────
    // pending        → employer has been shown payment instructions, not paid yet
    // paid           → admin confirmed M-Pesa payment received
    // in_progress    → work is underway
    // work_submitted → seeker marked work as done (optional step)
    // completed      → employer confirmed work done, 3-day window starts
    // released       → admin released funds to seeker
    // disputed       → seeker filed a dispute
    // refunded       → admin refunded employer after dispute
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "in_progress",
        "work_submitted",
        "completed",
        "released",
        "disputed",
        "refunded",
      ],
      default: "pending",
    },

    // ── M-Pesa Reference ───────────────────────────────────────
    mpesaReference: {
      type: String,
      default: null, // employer fills this in when paying
    },
    paymentConfirmedAt: {
      type: Date,
      default: null,
    },
    paymentConfirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // admin who confirmed
    },

    // ── Completion ─────────────────────────────────────────────
    workSubmittedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null, // when employer clicked "Confirm Work Done"
    },
    autoReleaseAt: {
      type: Date,
      default: null, // completedAt + 3 days
    },

    // ── Release ────────────────────────────────────────────────
    releasedAt: {
      type: Date,
      default: null,
    },
    releasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // admin who released
    },

    // ── Dispute ────────────────────────────────────────────────
    disputeReason: {
      type: String,
      default: null,
    },
    disputeFiledAt: {
      type: Date,
      default: null,
    },
    disputeResolvedAt: {
      type: Date,
      default: null,
    },
    disputeResolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    disputeOutcome: {
      type: String,
      enum: ["released", "refunded", null],
      default: null,
    },

    // ── Admin notes ────────────────────────────────────────────
    adminNotes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Auto-calculate fees before save ───────────────────────────
escrowSchema.pre("save", function (next) {
  if (this.isModified("agreedAmount") || this.isNew) {
    this.platformFee  = Math.round(this.agreedAmount * (this.platformFeePercent / 100));
    this.seekerPayout = this.agreedAmount - this.platformFee;
  }
  next();
});

export const Escrow = mongoose.model("Escrow", escrowSchema);
