import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your Name!"],
    minLength: [3, "Name must contain at least 3 Characters!"],
    maxLength: [30, "Name cannot exceed 30 Characters!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your Email!"],
    validate: [validator.isEmail, "Please provide a valid Email!"],
  },
  phone: {
    type: Number,
    required: [true, "Please enter your Phone Number!"],
  },
  address: {
    type: String,
    required: [true, "Please enter your Address!"],
  },
  niches: {
    firstNiche:  { type: String },
    secondNiche: { type: String },
    thirdNiche:  { type: String },
  },
  resume: {
    public_id: String,
    url:       String,
  },
  coverLetter: {
    type: String,
  },
  role: {
    type: String,
    enum:     ["Job Seeker", "Employer", "Admin"],
    required: [true, "Please select a role!"],
  },
  status: {
    type:    String,
    enum:    ["pending", "approved", "blocked"],
    default: "pending",
  },

  // ── PREMIUM ────────────────────────────────────────────────────────────────
  // Both Job Seekers and Employers need premium for:
  //   - In-app chat
  //   - Viewing contact info (phone / email) on jobs/profiles
  // Admin always bypasses these checks.
  isPremium: {
    type:    Boolean,
    default: false,
  },
  premiumExpiresAt: {
    type:    Date,
    default: null,
    // null = no expiry set (used when admin grants lifetime premium)
  },
  premiumGrantedBy: {
    // "admin" | "payment" — useful for audit trail
    type:    String,
    enum:    ["admin", "payment", null],
    default: null,
  },
  premiumGrantedAt: {
    type:    Date,
    default: null,
  },
  // ──────────────────────────────────────────────────────────────────────────

  password: {
    type:     String,
    required: [true, "Please enter your Password!"],
    minLength: [8, "Password must contain at least 8 characters!"],
    select:   false,
  },
  createdAt: {
    type:    Date,
    default: Date.now,
  },
});

// ── Auto-expire premium on fetch ────────────────────────────────────────────
// If premiumExpiresAt has passed, treat the user as free.
// This virtual lets you call user.isActivePremium anywhere.
userSchema.virtual("isActivePremium").get(function () {
  if (this.role === "Admin") return true;           // Admin always premium
  if (!this.isPremium) return false;
  if (!this.premiumExpiresAt) return true;          // No expiry = lifetime
  return this.premiumExpiresAt > new Date();
});

// ── Hash password before save ───────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ── Compare password ────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Generate JWT ────────────────────────────────────────────────────────────
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const User = mongoose.model("User", userSchema);
