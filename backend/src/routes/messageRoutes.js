import express from "express"

import { getMessages, sendMessage, markAsRead } from "../controllers/messageController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// SEND MESSAGE
router.post("/send", protect, sendMessage);
router.get("/:conversationId", protect, getMessages);
router.post("/mark-read", protect, markAsRead);

export default router; 
