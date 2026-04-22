// routes/sellerRoutes.js
import express from "express";
import {
  cancelDeal,
  confirmDeal,
  createProduct,
  deleteProduct,
  editProduct,
  generateOrderOtp,
  getAverageRating,
  getDailyEarnings,
  getEarnings,
  getInsights,
  getMyProducts,
  getNegotiatingConversations,
  getPendingEarnings,
  getSellerAnalytics,
  getSellerAverageRating,
  getSellerOrders,
  getTopProductThisWeek,
  getWeeklyEarnings,
  incrementViews,
  setupSeller,
  verifyOrderOtp,
} from "../controllers/sellerController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { checkSeller } from "../middleware/sellerMiddleware.js";
import { cache, invalidateCache } from "../middleware/cacheMiddleware.js";

const router = express.Router();

// ─────────────────────────────────────────────
// SELLER SETUP & PRODUCT MUTATIONS
// No caching — these are writes. They invalidate related caches.
// ─────────────────────────────────────────────

//  No cache — write operation
router.post("/setup", protect, upload.single("logo"), setupSeller);

//  No cache — invalidate product list + this seller's my-products cache
router.post(
  "/create",
  protect,
  checkSeller,
  upload.array("images", 5),
  async (req, res, next) => {
    // Attach post-handler invalidation after controller runs
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await invalidateCache(
          "cache:global:/api/products*",                          // public product list
          `cache:user:${req.user._id}:/api/seller/my-products*`, // seller's own product list
          `cache:user:${req.user._id}:/api/seller/insights*`,    // seller insight cards
          `cache:user:${req.user._id}:/api/seller/topProduct*`   // seller top product card
        );
      }
      return originalJson(data);
    };
    next();
  },
  createProduct
);

//  No cache — invalidate product detail + list + seller's product list
router.put(
  "/edit/:id",
  protect,
  checkSeller,
  upload.array("images", 5),
  async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await invalidateCache(
          `cache:global:/api/products/${req.params.id}*`,         // specific product
          "cache:global:/api/products*",                           // product list
          `cache:user:${req.user._id}:/api/seller/my-products*`,  // seller's list
          `cache:user:${req.user._id}:/api/seller/insights*`,     // seller insight cards
          `cache:user:${req.user._id}:/api/seller/topProduct*`    // seller top product card
        );
      }
      return originalJson(data);
    };
    next();
  },
  editProduct
);

//  No cache — invalidate product caches on delete
router.delete(
  "/delete/:id",
  protect,
  checkSeller,
  async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await invalidateCache(
          `cache:global:/api/products/${req.params.id}*`,
          "cache:global:/api/products*",
          `cache:user:${req.user._id}:/api/seller/my-products*`,
          `cache:user:${req.user._id}:/api/seller/insights*`,
          `cache:user:${req.user._id}:/api/seller/topProduct*`
        );
      }
      return originalJson(data);
    };
    next();
  },
  deleteProduct
);

// ─────────────────────────────────────────────
// PRODUCT READS
// ─────────────────────────────────────────────

//  Cache seller's own product list for 2 minutes
// Short TTL because inventory changes are somewhat frequent
router.get(
  "/my-products",
  protect,
  checkSeller,
  cache(120, { userSpecific: true }),  // scoped to each seller's userId
  getMyProducts
);

// ─────────────────────────────────────────────
// NEGOTIATIONS / DEALS
// Real-time — deal status changes instantly on confirm/cancel
// ─────────────────────────────────────────────

// NO CACHE — conversation status is real-time
// A buyer may accept/reject while seller is looking at the screen
router.get("/negotiations", protect, checkSeller, getNegotiatingConversations);

// No cache — write + real-time state change
router.put("/confirm/:conversationId", protect, checkSeller, confirmDeal);
router.put("/cancel/:conversationId", protect, checkSeller, cancelDeal);

// ─────────────────────────────────────────────
// ORDER MANAGEMENT
// Real-time — order delivery/OTP status must be live
// ─────────────────────────────────────────────

// NO CACHE — sellers need live order status (pending, delivered, disputed)
router.get("/orders", protect, checkSeller, getSellerOrders);

//  No cache — OTP verification is a one-time real-time event
router.post("/orders/:orderId", protect, checkSeller, verifyOrderOtp);

//  No cache — OTP generation must always be fresh
router.put("/otp", protect, checkSeller, generateOrderOtp);

// ─────────────────────────────────────────────
// ANALYTICS & DASHBOARD
// Safe to cache — computed aggregates, slight staleness is acceptable
// ─────────────────────────────────────────────

// Cache full analytics for 5 minutes (heavy DB aggregation)
router.get(
  "/analytics",
  protect,
  checkSeller,
  cache(300, { userSpecific: true }),
  getSellerAnalytics
);

// Cache product ratings for 5 minutes
router.get(
  "/productRatings",
  protect,
  checkSeller,
  cache(300, { userSpecific: true }),
  getAverageRating
);

// Cache seller-facing total earnings for 2 minutes
router.get(
  "/earnings",
  protect,
  checkSeller,
  cache(120, { userSpecific: true }),
  getEarnings
);

// Cache pending earnings for only 30 seconds
// Shorter TTL because pending → confirmed transitions should reflect quickly
router.get(
  "/pendingEarnings",
  protect,
  checkSeller,
  cache(30, { userSpecific: true }),
  getPendingEarnings
);

// Cache weekly earnings for 5 minutes
router.get(
  "/weeklyEarnings",
  protect,
  checkSeller,
  cache(300, { userSpecific: true }),
  getWeeklyEarnings
);

// Cache daily earnings for 2 minutes
router.get(
  "/dailyEarnings",
  protect,
  checkSeller,
  cache(120, { userSpecific: true }),
  getDailyEarnings
);

// Cache top product for 5 minutes
router.get(
  "/topProduct",
  protect,
  checkSeller,
  cache(300, { userSpecific: true }),
  getTopProductThisWeek
);

// Cache AI insights for 10 minutes (expensive to compute)
router.get(
  "/insights",
  protect,
  checkSeller,
  cache(600, { userSpecific: true }),
  getInsights
);

// ─────────────────────────────────────────────
// PUBLIC / MISC
// ─────────────────────────────────────────────

// Cache public seller rating for 5 minutes (global — same for all viewers)
router.get("/seller-rating/:sellerId", protect, cache(300), getSellerAverageRating);

// No cache — view increment is a write (counter update)
// Caching this would skip increments and give wrong view counts
router.patch("/views/:productId", protect, incrementViews);

export default router;
