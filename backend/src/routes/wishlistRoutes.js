import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get wishlist
router.get("/",protect, getWishlist);

// Toggle product
router.post("/toggle",protect, toggleWishlist);

export default router;