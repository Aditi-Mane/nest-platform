import express from "express"
import { cancelDeal, confirmDeal, createProduct, deleteProduct, editProduct, generateOrderOtp, getMyProducts, getSellerOrders, setupSeller, verifyOrderOtp} from "../controllers/sellerController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { checkSeller } from "../middleware/sellerMiddleware.js";

const router = express.Router();

router.post("/setup", protect, upload.single("logo"), setupSeller);
router.post("/create", protect, checkSeller, upload.array("images", 5), createProduct);
router.put("/edit/:id", protect, checkSeller, upload.array("images", 5), editProduct);
router.delete("/delete/:id", protect, checkSeller, deleteProduct)
router.get("/my-products", protect, checkSeller, getMyProducts);
router.put("/confirm/:conversationId", protect, checkSeller, confirmDeal);
router.put("/cancel/:conversationId", protect, checkSeller, cancelDeal);
router.get("/orders", protect, checkSeller, getSellerOrders);
router.post("/orders/:orderId", protect, checkSeller, verifyOrderOtp);
router.put("/otp", protect, checkSeller, generateOrderOtp);

export default router;