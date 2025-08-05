import express from "express";
import { isAuthorized } from "../middlewares/auth.js";
import {
  sendMessage,
  getMessagesByApplication,
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/send", isAuthorized, sendMessage);
router.get("/:applicationId", isAuthorized, getMessagesByApplication);

export default router;
