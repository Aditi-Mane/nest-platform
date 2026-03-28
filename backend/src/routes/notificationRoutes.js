import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getNotifications, markOneRead, markAllRead } from "../controllers/notificationController.js";
 
const router = express.Router();
 
router.get("/",             protect, getNotifications);
router.patch("/:id/read",   protect, markOneRead);
router.patch("/read-all",   protect, markAllRead);
 
export default router;