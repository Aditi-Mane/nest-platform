import express from "express";
import { getReviewsByProduct } from "../controllers/reviewController.js";

const router = express.Router();

router.get("/product/:id", getReviewsByProduct);

export default router;
