import express from "express"
import { getUserCart } from "../controllers/cartController.js"
import { isAuthenticated } from "../../../frontend/utils/getToken.js"

const router =express.Router();

router.get("/my-cart", isAuthenticated,getUserCart);

export default router;