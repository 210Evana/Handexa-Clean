import { Message } from "../models/messageSchema.js";
import { Application } from "../models/applicationSchema.js";
import mongoose from "mongoose";

/* ─────────────────────────────────────────────────────────────────────────────
   NOTE: We access `io` and `roomUsers` via req.app.get() instead of importing
   from server.js directly. A direct import would create a circular dependency:
     server.js → app.js → routes → controller → server.js  ← circular!
   server.js already calls app.set("io", io) and app.set("roomUsers", roomUsers)
   so we can safely read them from the Express app instance on each request.
───────────────────────────────────────────────────────────────────────────── */

/* ─── Helper: is the other party currently in the room? ─── */
const isOtherUserInRoom = (roomUsers, roomId, senderId) => {
  const usersInRoom = roomUsers?.[roomId];
  if (!usersInRoom) return false;
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

    // ── Determine initial status based on live presence ──
    const roomUsers    = req.app.get("roomUsers") || {};
    const initialStatus = isOtherUserInRoom(roomUsers, applicationId, req.user._id)
      ? "delivered"   // recipient is already in the chat room
      : "sent";       // recipient is offline / outside the room

    const newMessage = new Message({
      applicationId,
      sender: req.user._id,
      message,
      status: initialStatus,
    });

    await newMessage.save();
    const populatedMessage = await newMessage.populate("sender", "name email");

    // Emit to everyone in the socket room (sender + recipient)
    const io = req.app.get("io");
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
   Called by the frontend when the chat is opened or the window regains focus.
   Updates all unread messages in this room that weren't sent by the caller,
   then emits "messagesRead" so the sender's ticks turn coloured in real-time.
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
        status: { $in: ["sent", "delivered"] },  // not already read
      },
      { $set: { status: "read", readAt: now } }
    );

    if (result.modifiedCount > 0) {
      // Tell the sender their ticks should turn coloured
      const io = req.app.get("io");
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
