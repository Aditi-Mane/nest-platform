import express from "express";
import { getAllProducts, getProductById } from "../controllers/productController.js";
import { getMLRecommendations, recommendFromCart } from "../controllers/recommendationController.js";
import { cache } from "../middleware/cacheMiddleware.js"; 
const router = express.Router();

//Cache product list for 5 minutes
// Public route — global scope (same for all users)
router.get("/", cache(300), getAllProducts);

//Cache individual product for 60 sec
router.get("/:id",cache(60), getProductById);

// Cache ML recommendations per product for 10 minutes
router.get("/recommend-ml/:id", cache(600), getMLRecommendations);

router.post("/recommend-cart", recommendFromCart);


export default router;