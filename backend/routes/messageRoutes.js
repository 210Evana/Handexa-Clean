import express from "express";
import { isAuthorized } from "../middlewares/auth.js";
import { checkPremium } from "../middlewares/checkPremium.js";
import {
  sendMessage,
  getMessagesByApplication,
  markMessagesRead,
} from "../controllers/messageController.js";

const router = express.Router();

// All message routes require login AND premium
router.post("/send",                   isAuthorized, checkPremium, sendMessage);
router.get("/:applicationId",          isAuthorized, checkPremium, getMessagesByApplication);
router.put("/read/:applicationId",     isAuthorized, checkPremium, markMessagesRead);

export default router;
