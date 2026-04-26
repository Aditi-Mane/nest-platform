import express from "express";
import { getMyPurchases } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { cache } from "../middleware/cacheMiddleware.js"

const router=express.Router();

router.get("/purchases", protect, cache(20, { userSpecific: true }), getMyPurchases );

export default router;