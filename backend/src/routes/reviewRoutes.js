import express from "express";
import { createReview, getReviewsByProduct } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/product/:id", getReviewsByProduct);

export default router;
