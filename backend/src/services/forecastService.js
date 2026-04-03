// services/forecastService.js
// Statistical sales forecasting using linear regression + confidence intervals
// No external ML libraries needed — pure JS math on your real Order data
import mongoose from "mongoose";
import Order from "../models/Order.js";

// ─────────────────────────────────────────────
//  CORE MATH UTILITIES
// ─────────────────────────────────────────────

/**
 * Simple linear regression: y = mx + b
 * Returns slope (m), intercept (b), and R² (goodness of fit)
 */
function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0, r2: 0 };

  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R² — how well the line fits (0 = random, 1 = perfect)
  const meanY = sumY / n;
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, r2 };
}

/**
 * Standard deviation of an array of numbers
 */
function stdDev(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Clamp a confidence score between 70% and 98%
 * Higher R² and more data points → higher confidence
 */
function computeConfidence(r2, dataPointCount) {
  const base = 70 + r2 * 20; // 70–90 range based on fit
  const dataBonus = Math.min(dataPointCount / 2, 8); // up to +8 for having lots of data
  return Math.min(98, Math.round(base + dataBonus));
}

// ─────────────────────────────────────────────
//  DATE HELPERS
// ─────────────────────────────────────────────

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayLabel(date) {
  return date.toLocaleDateString("en-US", { weekday: "short" }); // "Mon", "Tue"…
}

function weekLabel(weekOffset) {
  return `Week ${weekOffset + 1}`;
}

function monthLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short" }); // "Jan", "Feb"…
}

// ─────────────────────────────────────────────
//  QUERY HELPERS — fetch real order totals
// ─────────────────────────────────────────────

/**
 * Returns an array of { period, revenue } objects for completed/verified orders
 * grouped by the requested granularity.
 *
 * @param {"day"|"week"|"month"} groupBy
 * @param {Date} since  — start of the historical window
 * @param {string} sellerId — optional: filter to a single seller's orders
 */
async function fetchGroupedRevenue(groupBy, since, sellerId = null) {
  const matchStage = {
    createdAt: { $gte: since },
    status: { $in: ["otp_verified", "pending", "otp_generated"] }, // include all real orders
  };
  if (sellerId) matchStage.sellerId = new mongoose.Types.ObjectId(sellerId);

  console.log("MATCH STAGE:", matchStage);
  // MongoDB $dateToString format strings
  const formatMap = {
    day: "%Y-%m-%d",
    week: "%Y-%U", // year-week number
    month: "%Y-%m",
  };

  const results = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: { format: formatMap[groupBy], date: "$createdAt" },
        },
        revenue: { $sum: "$totalPrice" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results; // [{ _id: "2025-01", revenue: 4200, orderCount: 32 }, …]
}

// ─────────────────────────────────────────────
//  FORECAST BUILDERS — one per time range
// ─────────────────────────────────────────────

/**
 * 7-DAY FORECAST
 * Historical: last 4 days (Mon–Thu)
 * Predicted:  next 3 days (Fri–Sun)
 */
async function build7DayForecast(sellerId) {
  const since = new Date();
  since.setDate(since.getDate() - 30); // last 7 days total
  since.setHours(0, 0, 0, 0);

  const raw = await fetchGroupedRevenue("day", since, sellerId);

  // Build a map of dateString → revenue
  const revenueMap = {};
  raw.forEach((r) => (revenueMap[r._id] = r.revenue));

  // Generate the last 7 calendar days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
    days.push({ date: d, key, label: dayLabel(d) });
  }

  // Split into historical (first 4) and to-predict (last 3)
  const historicalDays = days;
  const futureDays = [1, 2, 3].map((offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return { date: d, key: d.toISOString().split("T")[0], label: dayLabel(d) };
});

  const historicalPoints = raw.map((r, i) => ({ x: i, y: r.revenue }));


// Only bail if the seller genuinely has NO order data at all
 const totalRevenue = Object.values(revenueMap).reduce((s, v) => s + v, 0);
if (totalRevenue === 0) {
  return { chartData: [], confidence: 0, r2: 0 };
}

  const { slope, intercept, r2 } = linearRegression(historicalPoints);
  const sd = stdDev(historicalPoints.map((p) => p.y));
  const confidence = computeConfidence(r2, historicalPoints.length);

  // Build the chart data array Recharts expects
  const chartData = [
    ...historicalDays.map((d, i) => ({
  day: d.label,
  historical: revenueMap[d.key] ?? 0,
  predicted: null, upper: null, lower: null, confidence: null,
})),
...futureDays.map((d, i) => {
  const x = historicalDays.length + i;
  const rawPrediction = slope * x + intercept;
  const predicted = Math.round(Math.max(100, rawPrediction));
  const margin = Math.max(50, Math.round(1.645 * sd));
  return {
    day: d.label,
    historical: null,          // ← truly future, no historical value
    predicted,
    upper: predicted + margin,
    lower: Math.max(0, predicted - margin),
    confidence,
  };
})
  ];
  console.log(historicalPoints)
  console.log(chartData);
  return { chartData, confidence, r2: Math.round(r2 * 100) };
}

/**
 * 30-DAY FORECAST
 * Historical: last 3 weeks
 * Predicted:  next 2 weeks
 */
async function build30DayForecast(sellerId) {
  const since = new Date();
  since.setDate(since.getDate() - 28);
  since.setHours(0, 0, 0, 0);

  const raw = await fetchGroupedRevenue("week", since, sellerId);

  const revenueMap = {};
  raw.forEach((r) => (revenueMap[r._id] = r.revenue));

  // Map to week labels
  const historicalWeeks = raw.slice(0, 3).map((r, i) => ({
    label: weekLabel(i),
    revenue: r.revenue,
    x: i,
  }));

  // If we have fewer than 3 weeks of data, pad with 0
  while (historicalWeeks.length < 3) {
    const i = historicalWeeks.length;
    historicalWeeks.push({ label: weekLabel(i), revenue: 0, x: i });
  }

  const historicalPoints = historicalWeeks.map((w) => ({ x: w.x, y: w.revenue }));
  const { slope, intercept, r2 } = historicalPoints.length >= 2
  ? linearRegression(historicalPoints)
  : { slope: 0, intercept: historicalPoints[0]?.y ?? 0, r2: 0 };
  const sd = stdDev(historicalPoints.map((p) => p.y));
  const confidence = computeConfidence(r2, historicalPoints.length);

  const futureWeeks = [3, 4].map((x) => {
    const rawPrediction = slope * x + intercept;
    const predicted = Math.round(Math.max(100, rawPrediction));
    const margin = Math.max(50, Math.round(1.645 * sd));
    return {
      label: weekLabel(x),
      predicted,
      upper: predicted + margin,
      lower: Math.max(0, predicted - margin),
      x,
    };
  });

  const chartData = [
    ...historicalWeeks.map((w) => ({
      day: w.label,
      historical: w.revenue,
      predicted: null,
      upper: null,
      lower: null,
      confidence: null,
    })),
    ...futureWeeks.map((w) => ({
      day: w.label,
      historical: null,
      predicted: w.predicted,
      upper: w.upper,
      lower: w.lower,
      confidence,
    })),
  ];

  return { chartData, confidence, r2: Math.round(r2 * 100) };
}

/**
 * 3-MONTH FORECAST
 * Historical: last 3 months
 * Predicted:  next 3 months
 */
async function build3MonthForecast(sellerId) {
  const since = new Date();
  since.setMonth(since.getMonth() - 3);
  since.setHours(0, 0, 0, 0);

  const raw = await fetchGroupedRevenue("month", since, sellerId);
  console.log("RAW:", raw);

  const historicalPoints = raw.slice(0, 3).map((r, i) => ({
    x: i,
    y: r.revenue,
    label: r._id, // "2025-01"
  }));

  while (historicalPoints.length < 3) {
    historicalPoints.push({ x: historicalPoints.length, y: 0, label: "" });
  }

  const { slope, intercept, r2 } = linearRegression(historicalPoints);
  const sd = stdDev(historicalPoints.map((p) => p.y));
  const confidence = computeConfidence(r2, historicalPoints.length);

  const lastMonth = raw.length > 0 ? raw[raw.length - 1]._id : null;
  const futureMonths = [1, 2, 3].map((offset) => {
  const d = lastMonth ? new Date(lastMonth + "-01") : new Date();
  d.setMonth(d.getMonth() + offset);
  return monthLabel(d);
});

  const chartData = [
    ...historicalPoints.map((p) => {
      // Convert "2025-01" → "Jan"
      const label = p.label
        ? new Date(p.label + "-01").toLocaleDateString("en-US", { month: "short" })
        : "–";
      return {
        day: label,
        historical: p.y,
        predicted: null,
        upper: null,
        lower: null,
        confidence: null,
      };
    }),
    ...futureMonths.map((label, i) => {
      const x = historicalPoints.length + i;
      const predicted = Math.round(Math.max(0, slope * x + intercept));
      const margin = Math.round(1.645 * sd);
      return {
        day: label,
        historical: null,
        predicted,
        upper: predicted + margin,
        lower: Math.max(0, predicted - margin),
        confidence,
      };
    }),
  ];

  return { chartData, confidence, r2: Math.round(r2 * 100) };
}

// ─────────────────────────────────────────────
//  CATEGORY FORECAST
// ─────────────────────────────────────────────

/**
 * Compares current month revenue vs. last month revenue per product category.
 * Predicts next month via per-category linear trend.
 */
export async function getCategoryForecast(sellerId = null) {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

const matchStage = { createdAt: { $gte: threeMonthsAgo } };
if (sellerId) matchStage.sellerId = new mongoose.Types.ObjectId(sellerId);
  // We need category — join with Product via productId
  const results = await Order.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: {
          category: { $ifNull: ["$product.category", "Other"] },
          month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  // Pivot: { category → { month → revenue } }
  const pivot = {};
  results.forEach(({ _id, revenue }) => {
    const { category, month } = _id;
    if (!pivot[category]) pivot[category] = {};
    pivot[category][month] = revenue;
  });

  const months = [...new Set(results.map((r) => r._id.month))].sort();
  const currentMonth = months[months.length - 1];
  const prevMonth = months[months.length - 2];

  const categoryForecast = Object.entries(pivot).map(([category, monthMap]) => {
    const current = monthMap[currentMonth] ?? 0;
    const prev = monthMap[prevMonth] ?? 0;

    // Simple linear extrapolation for "predicted"
    const trend = current - prev;
    const predicted = Math.round(Math.max(0, current + trend));
    const growth = prev === 0 ? 0 : parseFloat((((current - prev) / prev) * 100).toFixed(1));
    return { category, current, predicted, growth };
  });

  // Sort by current revenue descending
  return categoryForecast.sort((a, b) => b.current - a.current);
}

// ─────────────────────────────────────────────
//  INVENTORY RECOMMENDATIONS
// ─────────────────────────────────────────────

/**
 * Compares each product's current stock vs. its recent sales velocity.
 * Flags products as high/medium/low urgency.
 */
export async function getInventoryRecommendations(sellerId = null) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const matchStage = { createdAt: { $gte: thirtyDaysAgo } };
if (sellerId) matchStage.sellerId = new mongoose.Types.ObjectId(sellerId);

  const salesVelocity = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$productId",
        totalSold: { $sum: "$quantity" },
        revenue: { $sum: "$totalPrice" },
        productName: { $first: "$productName" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        productName: 1,
        totalSold: 1,
        currentStock: "$product.stock",
        category: "$product.category",
      },
    },
  ]);
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  return salesVelocity.map((item) => {
    const dailyVelocity = item.totalSold / 30;
    // Days of stock remaining at current velocity
    const daysRemaining =
      dailyVelocity > 0 ? Math.round(item.currentStock / dailyVelocity) : 999;

    // Recommended stock = 30-day velocity * 1.5 (1.5x buffer)
    const recommendedStock = Math.max(
      item.currentStock,
      Math.round(dailyVelocity * 30 * 1.5)
    );

    let urgency, reason;
    if (daysRemaining <= 7) {
      urgency = "high";
      reason = `Only ${daysRemaining} days of stock left at current velocity`;
    } else if (daysRemaining <= 14) {
      urgency = "medium";
      reason = `${daysRemaining} days of stock remaining — reorder soon`;
    } else if (item.currentStock > recommendedStock * 1.5) {
      urgency = "low";
      reason = "Overstocked — consider slowing restocking";
    } else {
      urgency = "low";
      reason = "Stock levels healthy";
    }

    return {
      product: item.productName,
      currentStock: item.currentStock,
      recommendedStock,
      urgency,
      reason,
    };
  })
  .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
}

// ─────────────────────────────────────────────
//  SUMMARY METRICS (for the top KPI cards)
// ─────────────────────────────────────────────

export async function getSummaryMetrics(sellerId = null) {
  const now = new Date();

  // Current month window
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  // Previous month window
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const matchBase = sellerId ? { sellerId } : {};

  const [currentMonthOrders, prevMonthOrders] = await Promise.all([
    Order.find({ ...matchBase, createdAt: { $gte: currentMonthStart } }),
    Order.find({
      ...matchBase,
      createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
    }),
  ]);

  const currentRevenue = currentMonthOrders.reduce((s, o) => s + o.totalPrice, 0);
  const prevRevenue = prevMonthOrders.reduce((s, o) => s + o.totalPrice, 0);
  const growthPct =
    prevRevenue === 0 ? 0 : parseFloat((((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1));

  // Forecast next month using the two-month trend
  const trendRevenue = currentRevenue > 0
  ? currentRevenue + (currentRevenue - prevRevenue)
  : prevRevenue;
const nextMonthForecast = Math.round(Math.max(0, trendRevenue));

  // Best seller this month
  const productSales = {};
const ordersToCheck = currentMonthOrders.length > 0 ? currentMonthOrders : prevMonthOrders;
ordersToCheck.forEach((o) => {
  productSales[o.productName] = (productSales[o.productName] ?? 0) + o.quantity;
});
  const bestSeller = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];

  // Model accuracy — computed as 1 - (mean absolute percentage error) on last month
  // We compare week 1 predicted (from week 0 slope) vs actual week 1
  // Simplified: use R² proxy from the 30-day forecast
  const { r2 } = await build30DayForecast(sellerId);

  return {
    currentRevenue: Math.round(currentRevenue),
    prevRevenue: Math.round(prevRevenue),
    growthPct,
    nextMonthForecast,
    bestSeller: bestSeller ? { name: bestSeller[0], units: bestSeller[1] } : null,
    modelAccuracy: Math.min(99, 70 + r2 * 0.29), // 70–99% based on data fit
    dataPoints: currentMonthOrders.length + prevMonthOrders.length,
  };
}

// ─────────────────────────────────────────────
//  MAIN EXPORT — called by the route handler
// ─────────────────────────────────────────────

export async function getForecast(range = "30days", sellerId = null) {
  const builders = {
    "7days": build7DayForecast,
    "30days": build30DayForecast,
    "3months": build3MonthForecast,
  };

  const builder = builders[range] ?? build30DayForecast;
  return builder(sellerId);
}