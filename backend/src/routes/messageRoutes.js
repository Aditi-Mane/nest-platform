import express from "express"
import { getMessages, getTotalUnreadCount, markConversationAsRead, sendMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/unread", protect, getTotalUnreadCount);
router.get("/:conversationId", protect, getMessages);
router.patch("/:conversationId/read", protect, markConversationAsRead);

export default router;