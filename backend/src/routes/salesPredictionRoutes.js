// Express router for the Sales Forecast dashboard.
//
// Endpoints:
//   GET /api/analytics/forecast?range=7days|30days|3months
//   GET /api/analytics/category-forecast
//   GET /api/analytics/inventory
//   GET /api/analytics/summary
//   GET /api/analytics/ai-suggestions
//   GET /api/analytics/all          ← single call to load the full dashboard
//
// All endpoints accept an optional ?sellerId=<ObjectId> query param.
// If omitted, platform-wide data is returned (useful for admin views).
//
// Auth: add your own JWT middleware before these routes if needed.
 
import { protect } from "../middleware/authMiddleware.js" 
import express from "express";
import {
  getForecast,
  getCategoryForecast,
  getInventoryRecommendations,
  getSummaryMetrics,
} from "../services/forecastService.js";
import { getAISuggestions } from "../services/aiSuggestionsService.js";
 
const router = express.Router();
 
// ─────────────────────────────────────────────
//  HELPER — consistent error response
// ─────────────────────────────────────────────
function sendError(res, message, status = 500) {
  console.error(`[analytics] ${message}`);
  return res.status(status).json({ success: false, error: message });
}
 
// ─────────────────────────────────────────────
//  GET /api/analytics/forecast
//  Revenue forecast chart data for the given time range.
//
//  Query params:
//    range     — "7days" | "30days" | "3months"  (default: "30days")
//    sellerId  — MongoDB ObjectId string (optional)
//
//  Response:
//  {
//    success: true,
//    range: "30days",
//    chartData: [ { day, historical, predicted, upper, lower, confidence }, … ],
//    confidence: 91,
//    r2: 87
//  }
// ─────────────────────────────────────────────
router.get("/forecast", protect ,async (req, res) => {
  try {
    const { range = "30days" } = req.query;
    const sellerId = req.user.id;
    const validRanges = ["7days", "30days", "3months"];
 
    if (!validRanges.includes(range)) {
      return sendError(res, `Invalid range. Must be one of: ${validRanges.join(", ")}`, 400);
    }
 
    const data = await getForecast(range, sellerId);
    return res.json({ success: true, range, ...data });
  } catch (err) {
    return sendError(res, err.message);
  }
});
 
// ─────────────────────────────────────────────
//  GET /api/analytics/category-forecast
//  Current vs predicted revenue per product category.
//
//  Response:
//  {
//    success: true,
//    categories: [
//      { category: "Electronics", current: 4200, predicted: 5100, growth: 21.4 },
//      …
//    ]
//  }
// ─────────────────────────────────────────────
router.get("/category-forecast",protect, async (req, res) => {
  try {

    const sellerId = req.user.id;
    const categories = await getCategoryForecast(sellerId);
    return res.json({ success: true, categories });
  } catch (err) {
    return sendError(res, err.message);
  }
});
 
// ─────────────────────────────────────────────
//  GET /api/analytics/inventory
//  Per-product inventory health + restock recommendations.
//
//  Response:
//  {
//    success: true,
//    recommendations: [
//      {
//        product: "Ceramic Mug",
//        currentStock: 15,
//        recommendedStock: 45,
//        urgency: "high",
//        reason: "Only 6 days of stock left…"
//      },
//      …
//    ]
//  }
// ─────────────────────────────────────────────
router.get("/inventory",protect, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const recommendations = await getInventoryRecommendations(sellerId);
    return res.json({ success: true, recommendations });
  } catch (err) {
    return sendError(res, err.message);
  }
});
 
// ─────────────────────────────────────────────
//  GET /api/analytics/summary
//  Top-level KPI numbers for the dashboard header cards.
//
//  Response:
//  {
//    success: true,
//    currentRevenue: 8940,
//    prevRevenue: 7600,
//    growthPct: 17.6,
//    nextMonthForecast: 10280,
//    bestSeller: { name: "Ceramic Mug", units: 48 },
//    modelAccuracy: 92.4,
//    dataPoints: 142
//  }
// ─────────────────────────────────────────────
router.get("/summary",protect, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const metrics = await getSummaryMetrics(sellerId);
    return res.json({ success: true, ...metrics });
  } catch (err) {
    return sendError(res, err.message);
  }
});
 
// ─────────────────────────────────────────────
//  GET /api/analytics/ai-suggestions
//  Gemini-generated (or rule-based fallback) recommendations.
//
//  ⚠ This endpoint calls the Gemini API — add caching in production
//  to avoid burning through rate limits on every dashboard load.
//
//  Response:
//  {
//    success: true,
//    source: "gemini" | "fallback",
//    suggestions: [
//      {
//        icon: "Package",
//        title: "Restock Ceramic Mug immediately",
//        description: "Only 6 days of stock left…",
//        type: "warning",
//        impact: "High",
//        priority: 1
//      },
//      …
//    ]
//  }
// ─────────────────────────────────────────────
router.get("/ai-suggestions",protect ,async (req, res) => {
  try {
    const sellerId = req.user.id;
    const suggestions = await getAISuggestions(sellerId);
    const source = process.env.GEMINI_API_KEY ? "gemini" : "fallback";
    return res.json({ success: true, source, suggestions });
  } catch (err) {
    return sendError(res, err.message);
  }
});
 
// ─────────────────────────────────────────────
//  GET /api/analytics/all
//  Loads ALL dashboard data in a single request using Promise.all.
//  The frontend makes one call on mount instead of five separate ones.
//  AI suggestions are fetched in parallel but won't block other data
//  if Gemini is slow.
//
//  Query params:
//    range     — forecast time range (default "30days")
//    sellerId  — optional seller filter
//
//  Response: combined object with all sections.
// ─────────────────────────────────────────────
router.get("/all", protect,async (req, res) => {
  try {
    const { range = "30days" } = req.query;
    const sellerId = req.user.id;
    const validRanges = ["7days", "30days", "3months"];
 
    if (!validRanges.includes(range)) {
      return sendError(res, `Invalid range. Must be one of: ${validRanges.join(", ")}`, 400);
    }
 
    // Fire all queries in parallel — much faster than sequential awaits
    const [forecast, categories, inventory, summary, suggestions] = await Promise.all([
      getForecast(range, sellerId),
      getCategoryForecast(sellerId),
      getInventoryRecommendations(sellerId),
      getSummaryMetrics(sellerId),
      getAISuggestions(sellerId).catch((err) => {
        // AI suggestions failing should never break the dashboard
        console.error("[analytics/all] AI suggestions error:", err.message);
        return [];
      }),
    ]);
 
    return res.json({
      success: true,
      range,
      forecast,          // { chartData, confidence, r2 }
      categories,        // [ { category, current, predicted, growth }, … ]
      inventory,         // [ { product, currentStock, recommendedStock, urgency, reason }, … ]
      summary,           // { currentRevenue, nextMonthForecast, bestSeller, … }
      suggestions,       // [ { icon, title, description, type, impact, priority }, … ]
      aiSource: process.env.GEMINI_API_KEY ? "gemini" : "fallback",
    });
  } catch (err) {
    return sendError(res, err.message);
  }
});
 
export default router;