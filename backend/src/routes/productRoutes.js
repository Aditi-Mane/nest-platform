import express from "express";
import { getAllProducts, getProductById } from "../controllers/productController.js";
import { getMLRecommendations, recommendFromCart } from "../controllers/recommendationController.js";
const router = express.Router();

router.post("/recommend-cart", recommendFromCart);
router.get("/", getAllProducts);
router.get("/recommend-ml/:id", getMLRecommendations);
router.get("/:id", getProductById);


export default router;