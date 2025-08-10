import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Message } from "../models/messageSchema.js";
import { Application } from "../models/applicationSchema.js";
import mongoose from "mongoose";
import { io } from "../server.js"; // Import io

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

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

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

    const newMessage = new Message({
      applicationId,
      sender: req.user._id,
      message,
    });

    await newMessage.save();
    const populatedMessage = await newMessage.populate("sender", "name email");

    io.to(applicationId).emit("receiveMessage", populatedMessage); // Use exported io

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