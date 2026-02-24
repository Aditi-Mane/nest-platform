import express from "express"
import { getUserCart } from "../controllers/cartController.js"
import { addToCart } from "../controllers/cartController.js";
import { removeFromCart, updateCartQuantity, clearCart } from "../controllers/cartController.js";
import { isAuthenticated } from "../../../frontend/utils/getToken.js"
import { protect } from "../middleware/authMiddleware.js"
const router =express.Router();

router.get("/", protect, getUserCart);  
router.post("/add",protect,addToCart);
router.delete("/remove/:productId", protect, removeFromCart);
router.put("/update/:productId", protect, updateCartQuantity);
router.delete("/clear", protect, clearCart);

export default router;