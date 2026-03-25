import express from "express";
import {
  getMessages,
  sendMessage,
  markConversationAsRead,
  getTotalUnreadCount
} from "../controllers/messageController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// SEND MESSAGE
router.post("/send", protect, sendMessage);

// GET TOTAL UNREAD COUNT (for navbar)
router.get("/unread", protect, getTotalUnreadCount);

// GET MESSAGES OF A CONVERSATION
router.get("/:conversationId", protect, getMessages);

// MARK CONVERSATION AS READ
router.patch("/:conversationId/read", protect, markConversationAsRead);

export default router;
