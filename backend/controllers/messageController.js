import { Message } from "../models/messageSchema.js";
import { Application } from "../models/applicationSchema.js";
import mongoose from "mongoose";

/* ─── Helper: safe string conversion for any ID format ─── */
const str = (id) => (id ? id.toString() : "");

/* ─── Helper: check if user is a party to the application ─── */
const isParty = (application, userId) => {
  const uid = str(userId);
  const applicant = str(application.applicantID?.user);
  const employer  = str(application.employerID?.user);
  return uid === applicant || uid === employer;
};

/* ─── Helper: is the other party currently in the room? ─── */
const isOtherUserInRoom = (roomUsers, roomId, senderId) => {
  const usersInRoom = roomUsers?.[roomId];
  if (!usersInRoom) return false;
  return [...usersInRoom].some((id) => str(id) !== str(senderId));
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

    if (!isParty(application, req.user._id)) {
      return res.status(403).json({
        message: "Not authorized to view messages for this application",
      });
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

    if (!isParty(application, req.user._id)) {
      return res.status(403).json({
        message: "Not authorized to send messages for this application",
      });
    }

    const roomUsers     = req.app.get("roomUsers") || {};
    const initialStatus = isOtherUserInRoom(roomUsers, applicationId, req.user._id)
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

    if (!isParty(application, req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const now = new Date();

    const result = await Message.updateMany(
      {
        applicationId,
        sender: { $ne: req.user._id },
        status: { $in: ["sent", "delivered"] },
      },
      { $set: { status: "read", readAt: now } }
    );

    if (result.modifiedCount > 0) {
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
