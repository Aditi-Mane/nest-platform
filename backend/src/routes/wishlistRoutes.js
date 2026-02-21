import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController.js";

const router = express.Router();

// Get wishlist
router.get("/:userId", getWishlist);

// Toggle product
router.post("/toggle", toggleWishlist);

export default router;