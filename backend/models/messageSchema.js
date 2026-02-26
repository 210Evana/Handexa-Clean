import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },

    // ── Read receipt status ─────────────────────────────────────────
    // "sent"      → saved to DB; recipient is offline or not in the room
    // "delivered" → recipient is in the chat room but hasn't viewed yet
    // "read"      → recipient has seen the message
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
