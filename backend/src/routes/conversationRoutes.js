import express from "express";
import { createConversation, getConversationInfo, getSellerConversations } from "../controllers/conversationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkSeller } from "../middleware/sellerMiddleware.js";

const router= express.Router();

router.post("/create",protect, createConversation);
router.get("/seller", protect, checkSeller, getSellerConversations);
router.get("/:conversationId", protect, getConversationInfo)

export default router;