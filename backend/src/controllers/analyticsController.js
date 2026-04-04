import * as analyticsService from "../services/analyticsService.js";

/* ---------------- HELPERS ---------------- */

const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatTrendLabel = (dateString, range) => {
  const date = new Date(`${dateString}T00:00:00`);

  if (range === "30d") {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  }

  return daysMap[date.getDay()];
};

const formatTrendData = (rawData, range, valueKey) =>
  rawData.map((item) => ({
    name: formatTrendLabel(item._id.date, range),
    value: item[valueKey],
  }));

/* ---------------- OVERVIEW ---------------- */

export const getOverviewStats = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { range = "7d" } = req.query;

    const data = await analyticsService.getOverviewStats(sellerId, range);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Overview Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overview stats",
    });
  }
};

/* ---------------- REVENUE TREND ---------------- */

export const getRevenueTrend = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { range = "7d" } = req.query;

    const rawData = await analyticsService.getRevenueTrend(sellerId, range);
    const formatted = formatTrendData(rawData, range, "revenue");

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Revenue Trend Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue trend",
    });
  }
};

/* ---------------- ORDERS TREND ---------------- */

export const getOrdersTrend = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { range = "7d" } = req.query;

    const rawData = await analyticsService.getOrdersTrend(sellerId, range);
    const formatted = formatTrendData(rawData, range, "count");

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Orders Trend Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders trend",
    });
  }
};

/* ---------------- VIEWS TREND ---------------- */

export const getViewsTrend = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { range = "7d" } = req.query;

    const rawData = await analyticsService.getViewsTrend(sellerId, range);
    const formatted = formatTrendData(rawData, range, "views");

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Views Trend Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch views trend",
    });
  }
};

/* ---------------- CONVERSION FUNNEL ---------------- */

export const getConversionFunnel = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const data = await analyticsService.getConversionFunnel(sellerId);

    const { views = 0, inquiries = 0, orders = 0, completed = 0 } = data;

    res.json({
      success: true,
      data: { views, inquiries, orders, completed },
    });
  } catch (error) {
    console.error("Funnel Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversion funnel",
    });
  }
};

/* ---------------- CONVERSATION STATS ---------------- */

export const getConversationStats = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const data = await analyticsService.getConversationStats(sellerId);

    const {
      total = 0,
      active = 0,
      confirmed = 0,
      cancelled = 0,
      completed = 0,
    } = data;

    res.json({
      success: true,
      data: { total, active, confirmed, cancelled, completed },
    });
  } catch (error) {
    console.error("Conversation Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation stats",
    });
  }
};

/* ---------------- TOP PRODUCTS ---------------- */

export const getTopProducts = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const rawData = await analyticsService.getTopProducts(sellerId);

    const formatted = rawData.map((item, index) => ({
      id: item._id,
      name: item.productName || "Unknown",
      image: item.productImage || "",
      sales: item.totalSales,
      revenue: item.revenue,
      rank: index + 1,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Top Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch top products",
    });
  }
};

// FIX: getLowProducts was defined here directly using Product + mongoose
//      without importing them, causing a ReferenceError at runtime.
//      It now lives in analyticsService.js (see that file).
//      This controller simply delegates to the service like every other handler.
export const getLowProductsHandler = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const rawData = await analyticsService.getLowProducts(sellerId);

    const formatted = rawData.map((item, index) => ({
      id: item._id,
      name: item.name || "Unknown",
      image: item.images?.[0]?.url || "",
      views: item.views || 0,
      sales: item.sales || 0,
      conversionRate: Number(item.conversionRate || 0).toFixed(1),
      rank: index + 1,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Low Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch low-performing products",
    });
  }
};

/* ---------------- DASHBOARD (ALL-IN-ONE) ---------------- */

export const getDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { range = "7d" } = req.query;

    const [
      overview,
      revenueRaw,
      ordersRaw,
      viewsRaw,
      funnel,
      conversations,
      topProductsRaw,
      lowProductsRaw,
    ] = await Promise.all([
      analyticsService.getOverviewStats(sellerId, range),
      analyticsService.getRevenueTrend(sellerId, range),
      analyticsService.getOrdersTrend(sellerId, range),
      analyticsService.getViewsTrend(sellerId, range),
      analyticsService.getConversionFunnel(sellerId),
      analyticsService.getConversationStats(sellerId),
      analyticsService.getTopProducts(sellerId),
      analyticsService.getLowProducts(sellerId), 
    ]);

    const revenue = formatTrendData(revenueRaw, range, "revenue");
    const orders = formatTrendData(ordersRaw, range, "count");
    const views = formatTrendData(viewsRaw, range, "views");

    const topProducts = topProductsRaw.map((item, index) => ({
      id: item._id,
      name: item.productName || "Unknown",
      image: item.productImage || "",
      sales: item.totalSales,
      revenue: item.revenue,
      rank: index + 1,
    }));

    const lowProducts = lowProductsRaw.map((item, index) => ({
      id: item._id,
      name: item.name || "Unknown",
      image: item.images?.[0]?.url || "",
      views: item.views || 0,
      sales: item.sales || 0,
      conversionRate: Number(item.conversionRate || 0).toFixed(1),
      rank: index + 1,
    }));

    res.json({
      success: true,
      data: {
        overview,
        revenue,
        orders,
        views,
        funnel,
        conversations,
        topProducts,
        lowProducts,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard",
    });
  }
};