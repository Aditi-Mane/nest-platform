import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkSeller } from "../middleware/sellerMiddleware.js";
import { getConversationStats, getConversionFunnel, getDashboard, getOrdersTrend, getOverviewStats, getRevenueTrend, getTopProducts } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/overview", protect, checkSeller, getOverviewStats);
router.get("/revenue-trend", protect, checkSeller, getRevenueTrend);
router.get("/orders-trend", protect, checkSeller, getOrdersTrend);
router.get("/funnel", protect, checkSeller, getConversionFunnel);
router.get("/conversations", protect, checkSeller, getConversationStats);
router.get("/top-products",  protect, checkSeller, getTopProducts);

router.get("/dashboard", protect, checkSeller, getDashboard);

export default router;