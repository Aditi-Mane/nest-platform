import express from "express";
import { getMyPurchases } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router=express.Router();

router.get("/purchases", protect, getMyPurchases );

export default router;