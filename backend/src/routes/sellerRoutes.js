import express from "express"
import { cancelDeal, confirmDeal, createProduct, deleteProduct, editProduct, 
  generateOrderOtp, getAverageRating, getDailyEarnings, getEarnings, getInsights, getMyProducts, 
  getNegotiatingConversations, getPendingEarnings, getSellerAnalytics, getSellerAverageRating, getSellerOrders, 
  getTopProductThisWeek, getWeeklyEarnings, incrementViews, setupSeller, verifyOrderOtp} from "../controllers/sellerController.js";
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
router.get("/analytics", protect, checkSeller, getSellerAnalytics);
router.get("/productRatings", protect, checkSeller, getAverageRating);
router.patch("/views/:productId", protect, incrementViews);

router.get("/seller-rating/:sellerId", protect, getSellerAverageRating);

//seller dashboard routes

router.get("/earnings", protect, checkSeller, getEarnings);
router.get("/pendingEarnings", protect, checkSeller, getPendingEarnings);
router.get("/negotiations", protect, checkSeller, getNegotiatingConversations);
router.get("/weeklyEarnings", protect, checkSeller, getWeeklyEarnings);
router.get("/dailyEarnings", protect, checkSeller, getDailyEarnings);
router.get("/topProduct", protect, checkSeller, getTopProductThisWeek);
router.get("/insights", protect, checkSeller, getInsights);

export default router;