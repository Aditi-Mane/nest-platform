// services/aiSuggestionsService.js
// Uses Google Gemini (free tier) to generate actionable sales recommendations
// based on your real product and order data.
//
// Free tier limits (as of 2025): 15 requests/min, 1M tokens/day — plenty for a dashboard.

import { GoogleGenerativeAI } from "@google/generative-ai";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────
//  BUILD A DATA SNAPSHOT FOR GEMINI
//  We never send raw DB objects — only a clean
//  summary so the prompt stays small & focused.
// ─────────────────────────────────────────────

async function buildDataSnapshot(sellerId = null) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const baseMatch = sellerId ? { sellerId } : {};

  // ── Recent orders (last 30 days) ──
  const recentOrders = await Order.find({
    ...baseMatch,
    createdAt: { $gte: thirtyDaysAgo },
  }).lean();

  // ── Previous period (30–60 days ago) for comparison ──
  const prevOrders = await Order.find({
    ...baseMatch,
    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
  }).lean();

  // ── All active products ──
  const productQuery = sellerId ? { createdBy: sellerId } : {};
  const products = await Product.find(productQuery)
    .select("name category stock status price averageRating reviewCount sentimentStats views")
    .lean();

  // ── Aggregate per-product sales ──
  const productSalesMap = {};
  recentOrders.forEach((o) => {
    const id = o.productId.toString();
    if (!productSalesMap[id]) {
      productSalesMap[id] = { name: o.productName, unitsSold: 0, revenue: 0 };
    }
    productSalesMap[id].unitsSold += o.quantity;
    productSalesMap[id].revenue += o.totalPrice;
  });

  const prevProductSalesMap = {};
  prevOrders.forEach((o) => {
    const id = o.productId.toString();
    if (!prevProductSalesMap[id]) {
      prevProductSalesMap[id] = { unitsSold: 0, revenue: 0 };
    }
    prevProductSalesMap[id].unitsSold += o.quantity;
    prevProductSalesMap[id].revenue += o.totalPrice;
  });

  // ── Build per-product summary ──
  const productSummaries = products.map((p) => {
    const id = p._id.toString();
    const recent = productSalesMap[id] ?? { unitsSold: 0, revenue: 0 };
    const prev = prevProductSalesMap[id] ?? { unitsSold: 0, revenue: 0 };
    const momChange =
      prev.unitsSold === 0
        ? null
        : Math.round(((recent.unitsSold - prev.unitsSold) / prev.unitsSold) * 100);

    // Days of stock remaining at current sales velocity
    const dailyVelocity = recent.unitsSold / 30;
    const daysOfStock =
      dailyVelocity > 0 ? Math.round(p.stock / dailyVelocity) : null;

    return {
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      status: p.status,
      views: p.views,
      rating: p.averageRating,
      reviews: p.reviewCount,
      sentiment: p.sentimentStats, // { positive, neutral, negative }
      unitsSoldLast30Days: recent.unitsSold,
      revenueLast30Days: Math.round(recent.revenue),
      monthOverMonthChange: momChange, // % change vs previous 30 days, null if no prev data
      daysOfStockRemaining: daysOfStock, // null means not selling at all
    };
  });

  // ── Overall totals ──
  const totalRecentRevenue = recentOrders.reduce((s, o) => s + o.totalPrice, 0);
  const totalPrevRevenue = prevOrders.reduce((s, o) => s + o.totalPrice, 0);
  const overallMoM =
    totalPrevRevenue === 0
      ? null
      : Math.round(((totalRecentRevenue - totalPrevRevenue) / totalPrevRevenue) * 100);

  return {
    period: "last 30 days",
    totalRevenue: Math.round(totalRecentRevenue),
    totalOrders: recentOrders.length,
    overallMonthOverMonthChange: overallMoM,
    products: productSummaries,
  };
}

// ─────────────────────────────────────────────
//  PROMPT BUILDER
// ─────────────────────────────────────────────

function buildPrompt(snapshot) {
  return `
You are an expert e-commerce analyst for a student campus marketplace called "CampusMart".
Sellers are students selling products like study materials, electronics, fashion, handmade goods, and hostel essentials.

Here is the current sales snapshot for this seller (JSON):

${JSON.stringify(snapshot, null, 2)}

Based on this real data, generate exactly 4 actionable AI recommendations.

Rules:
- Be specific: reference actual product names, numbers, and percentages from the data.
- Keep each description under 25 words.
- Each suggestion must be genuinely useful and grounded in the numbers.
- Cover a mix of: inventory actions, marketing opportunities, at-risk products, and seasonal/trend observations.
- "type" must be one of: "opportunity", "action", "seasonal", "warning"
- "impact" must be one of: "High", "Medium", "Low"
- "priority" must be 1, 2, or 3 (1 = most urgent)

Respond ONLY with a valid JSON array. No markdown, no explanation, no backticks.

[
  {
    "icon": "Package" | "TrendingUp" | "Sparkles" | "AlertTriangle",
    "title": "Short actionable title (max 10 words)",
    "description": "Specific insight using real numbers from the data (max 25 words)",
    "type": "opportunity" | "action" | "seasonal" | "warning",
    "impact": "High" | "Medium" | "Low",
    "priority": 1 | 2 | 3
  }
]
`.trim();
}

// ─────────────────────────────────────────────
//  FALLBACK SUGGESTIONS
//  Used when: no API key set, Gemini is down,
//  or the seller has very little data yet.
// ─────────────────────────────────────────────

function getFallbackSuggestions(snapshot) {
  const suggestions = [];

  // Check for low stock products
  const lowStock = snapshot.products.filter(
    (p) => p.daysOfStockRemaining !== null && p.daysOfStockRemaining <= 7
  );
  if (lowStock.length > 0) {
    suggestions.push({
      icon: "AlertTriangle",
      title: `Restock ${lowStock[0].name} immediately`,
      description: `Only ${lowStock[0].daysOfStockRemaining} days of stock left at current sales velocity.`,
      type: "warning",
      impact: "High",
      priority: 1,
    });
  }

  // Check for declining products
  const declining = snapshot.products.filter(
    (p) => p.monthOverMonthChange !== null && p.monthOverMonthChange < -15
  );
  if (declining.length > 0) {
    suggestions.push({
      icon: "TrendingUp",
      title: `Revive ${declining[0].name} with a discount`,
      description: `Sales down ${Math.abs(declining[0].monthOverMonthChange)}% this month. A 10–15% discount could recover momentum.`,
      type: "action",
      impact: "Medium",
      priority: 2,
    });
  }

  // Best performing product — double down
  const top = [...snapshot.products].sort(
    (a, b) => b.revenueLast30Days - a.revenueLast30Days
  )[0];
  if (top && top.revenueLast30Days > 0) {
    suggestions.push({
      icon: "Sparkles",
      title: `Boost ${top.name} visibility`,
      description: `Your top earner (₹${top.revenueLast30Days}) — promote it on WhatsApp groups to drive more orders.`,
      type: "opportunity",
      impact: "High",
      priority: 1,
    });
  }

  // Generic inventory health
  const overstocked = snapshot.products.filter(
    (p) => p.stock > 20 && p.unitsSoldLast30Days === 0
  );
  if (overstocked.length > 0) {
    suggestions.push({
      icon: "Package",
      title: `${overstocked[0].name} has zero sales`,
      description: `${overstocked[0].stock} units in stock with no recent orders. Consider a flash sale or price drop.`,
      type: "warning",
      impact: "Medium",
      priority: 3,
    });
  }

  // Pad to 4 if needed
  while (suggestions.length < 4) {
    suggestions.push({
      icon: "TrendingUp",
      title: "List more products to unlock insights",
      description: "More sales history helps the AI generate precise, data-driven recommendations for your store.",
      type: "opportunity",
      impact: "Low",
      priority: 3,
    });
  }

  return suggestions.slice(0, 4);
}

// ─────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────

/**
 * Returns 4 AI-generated suggestions for the given seller.
 * Falls back to rule-based suggestions if Gemini is unavailable.
 *
 * @param {string|null} sellerId  — ObjectId string or null for platform-wide
 * @returns {Promise<Array>}
 */
export async function getAISuggestions(sellerId = null) {
  // Step 1: build the data snapshot from real DB data
  const snapshot = await buildDataSnapshot(sellerId);

  // Step 2: if no API key configured, return rule-based fallback immediately
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[aiSuggestionsService] GEMINI_API_KEY not set — using fallback suggestions.");
    return getFallbackSuggestions(snapshot);
  }

  try {
    // Step 3: call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = buildPrompt(snapshot);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Step 4: parse the JSON response
    // Strip any accidental markdown code fences Gemini might add
    const clean = text.replace(/```json|```/gi, "").trim();
    const suggestions = JSON.parse(clean);

    // Validate it's an array of 4
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error("Gemini returned unexpected format");
    }

    return suggestions.slice(0, 4);
  } catch (err) {
    console.error("[aiSuggestionsService] Gemini call failed, using fallback:", err.message);
    return getFallbackSuggestions(snapshot);
  }
}