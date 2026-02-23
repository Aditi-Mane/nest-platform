import express from "express";
import { createConversation } from "../controllers/conversationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router= express.Router();

router.post("/create",protect, createConversation);

export default router;