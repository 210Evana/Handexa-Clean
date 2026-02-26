import express from "express";
import { isAuthorized } from "../middlewares/auth.js";
import {
  sendMessage,
  getMessagesByApplication,
  markMessagesRead,
} from "../controllers/messageController.js";

const router = express.Router();

// Send a new message
router.post("/send", isAuthorized, sendMessage);

// Get all messages for an application
router.get("/:applicationId", isAuthorized, getMessagesByApplication);

// Mark all messages in an application as read
// Called by the frontend when the chat window is opened or focused
router.put("/read/:applicationId", isAuthorized, markMessagesRead);

export default router;
