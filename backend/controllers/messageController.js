import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Message } from "../models/messageSchema.js";
import { Application } from "../models/applicationSchema.js";
import ErrorHandler from "../middlewares/error.js";

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { applicationId, message } = req.body;
  const senderId = req.user._id;
  const senderName = req.user.name;
  const application = await Application.findById(applicationId);
  if (!application) return next(new ErrorHandler("Application not found", 404));
  if (!message.trim()) return next(new ErrorHandler("Message cannot be empty", 400));
  const newMessage = await Message.create({
    applicationId,
    sender: senderId,
    message,
  });
  const io = req.app.get("io");
  if (io) {
    io.to(applicationId).emit("receiveMessage", {
      _id: newMessage._id,
      applicationId,
      message: newMessage.message,
      sender: { _id: senderId, name: senderName },
      createdAt: newMessage.createdAt,
    });
  }
  res.status(201).json({ success: true, message: "Message sent", newMessage });
});

export const getMessagesByApplication = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;
  console.log("Fetching messages for applicationId:", applicationId);
  const application = await Application.findById(applicationId);
  if (!application) {
    console.error("Application not found for ID:", applicationId);
    return next(new ErrorHandler("Application not found", 404));
  }
  const messages = await Message.find({ applicationId })
    .populate("sender", "name")
    .sort({ createdAt: 1 });
  console.log("Messages fetched:", messages);
  res.status(200).json({ success: true, messages: messages || [] });
});