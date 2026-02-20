import express from "express"
import { getUserCart } from "../controllers/cartController.js"
import { addToCart } from "../controllers/cartController.js";
import { isAuthenticated } from "../../../frontend/utils/getToken.js"
import { protect } from "../middleware/authMiddleware.js"
const router =express.Router();

router.get("/my-cart", isAuthenticated,getUserCart);
router.post("/add",protect,addToCart);

export default router;