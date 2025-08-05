import express from "express";
import { 
    createConversation,
    getConversations,
    getSingleConversation,
    updateConversation,

 } from "../controllers/conversationController.js";
import {isAuthorized} from "../middleware/auth.js";

const router = express.Router();

router.get  ("/", isAuthorized, getConversations); 
router.post ("/", isAuthorized,createConversation );  
router.get("/single/:id", isAuthorized, getSingleConversation); 
router.put ("/:id", isAuthorized, updateConversation );  



export default router;
