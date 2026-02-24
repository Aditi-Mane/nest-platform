import express from "express"
import { getMessages, sendMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/:conversationId", protect, getMessages);

export default router;