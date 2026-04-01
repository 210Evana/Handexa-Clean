import express from "express";
import { isAuthorized } from "../middlewares/auth.js";
//import { checkPremium } from "../middlewares/checkPremium.js";
import {
  sendMessage,
  getMessagesByApplication,
  markMessagesRead,
} from "../controllers/messageController.js";

const router = express.Router();

// All message routes require login AND premium
router.post("/send",                   isAuthorized, sendMessage);
router.get("/:applicationId",          isAuthorized, getMessagesByApplication);
router.put("/read/:applicationId",     isAuthorized, markMessagesRead);

export default router;
