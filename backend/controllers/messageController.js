import { Message } from "../models/messageSchema.js";
import { Application } from "../models/applicationSchema.js";
import mongoose from "mongoose";
import { io, roomUsers } from "../server.js"; // roomUsers is the presence map (added below)

/* ─── Helper: check if the other party is currently in the room ─── */
const isOtherUserInRoom = (roomId, senderId) => {
  const usersInRoom = roomUsers[roomId];
  if (!usersInRoom) return false;
  // Return true if anyone OTHER than the sender is in the room
  return [...usersInRoom].some((id) => id.toString() !== senderId.toString());
};

/* ════════════════════════════════════════
   GET messages for an application
════════════════════════════════════════ */
export const getMessagesByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Authorization: only the applicant or the employer can read messages
    if (
      application.applicantID.user.toString() !== req.user._id.toString() &&
      application.employerID.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to view messages for this application" });
    }

    const messages = await Message.find({ applicationId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

/* ════════════════════════════════════════
   SEND a message
════════════════════════════════════════ */
export const sendMessage = async (req, res) => {
  try {
    const { applicationId, message } = req.body;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    if (!applicationId || !message) {
      return res.status(400).json({ message: "Application ID and message are required" });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (
      application.applicantID.user.toString() !== req.user._id.toString() &&
      application.employerID.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to send messages for this application" });
    }

    // ── Set initial status based on presence ──────────────────────
    // If the recipient is already in the room → "delivered"
    // Otherwise → "sent" (they'll get upgraded when they join)
    const initialStatus = isOtherUserInRoom(applicationId, req.user._id)
      ? "delivered"
      : "sent";

    const newMessage = new Message({
      applicationId,
      sender: req.user._id,
      message,
      status: initialStatus,
    });

    await newMessage.save();
    const populatedMessage = await newMessage.populate("sender", "name email");

    // Broadcast to everyone in the socket room
    io.to(applicationId).emit("receiveMessage", populatedMessage);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      newMessage: populatedMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

/* ════════════════════════════════════════
   MARK messages as READ
   Called when the recipient opens/focuses the chat.
   Updates all unread messages in this application that
   were NOT sent by the current user.
════════════════════════════════════════ */
export const markMessagesRead = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (
      application.applicantID.user.toString() !== req.user._id.toString() &&
      application.employerID.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const now = new Date();

    const result = await Message.updateMany(
      {
        applicationId,
        sender: { $ne: req.user._id },           // messages I did NOT send
        status: { $in: ["sent", "delivered"] },   // not already read
      },
      {
        $set: { status: "read", readAt: now },
      }
    );

    if (result.modifiedCount > 0) {
      // Tell everyone in the room so the sender's ticks turn coloured
      io.to(applicationId).emit("messagesRead", {
        applicationId,
        readBy: req.user._id,
        readAt: now,
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} message(s) marked as read`,
    });
  } catch (error) {
    console.error("Error marking messages read:", error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};
