import express from "express";
import { createReview, getReviewsByProduct, getProductSentimentBySeller, getReviewInsights } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/product/:id", getReviewsByProduct);
router.get("/product-sentiment", getProductSentimentBySeller);
router.get("/seller-product-sentiment", protect,getProductSentimentBySeller);
router.get("/review-insights", protect, getReviewInsights);

export default router;
