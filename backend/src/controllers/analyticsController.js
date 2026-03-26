import * as analyticsService from "../services/analyticsService.js";

/* ---------------- HELPERS ---------------- */

const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const safeDivide = (a, b) => (b === 0 ? 0 : (a / b) * 100);

/* ---------------- OVERVIEW ---------------- */

export const getOverviewStats = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { range = "7d" } = req.query;

    const data = await analyticsService.getOverviewStats(
      sellerId,
      range
    );

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

    const rawData = await analyticsService.getRevenueTrend(
      sellerId,
      range
    );

    const formatted = rawData.map((item) => ({
      name: daysMap[item._id.day - 1],
      value: item.revenue,
    }));

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

    const rawData = await analyticsService.getOrdersTrend(
      sellerId,
      range
    );

    const formatted = rawData.map((item) => ({
      name: daysMap[item._id.day - 1],
      value: item.count,
    }));

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

/* ---------------- CONVERSION FUNNEL ---------------- */

export const getConversionFunnel = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const data = await analyticsService.getConversionFunnel(sellerId);

    const {
      views = 0,
      inquiries = 0,
      orders = 0,
      completed = 0,
    } = data;

    const enriched = {
      views,
      inquiries,
      orders,
      completed,
    };

    res.json({
      success: true,
      data: enriched,
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

    const total = data.total || 0;
    const active = data.active || 0;
    const confirmed = data.confirmed || 0;
    const cancelled = data.cancelled || 0;
    const completed = data.completed || 0;

    const enriched = {
      total,
      active,
      confirmed,
      cancelled,
      completed,
    };

    res.json({
      success: true,
      data: enriched,
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
      name: item.product?.name || "Unknown",
      image: item.product?.images?.[0]?.url || "",
      sales: item.totalSales,
      revenue: item.revenue,
      rank: index + 1,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Top Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top products",
    });
  }
};

/* ---------------- OPTIONAL: DASHBOARD (ALL-IN-ONE) ---------------- */

export const getDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { range = "7d" } = req.query;

    const [
      overview,
      revenueRaw,
      ordersRaw,
      funnel,
      conversations,
      topProductsRaw,
    ] = await Promise.all([
      analyticsService.getOverviewStats(sellerId, range),
      analyticsService.getRevenueTrend(sellerId, range),
      analyticsService.getOrdersTrend(sellerId, range),
      analyticsService.getConversionFunnel(sellerId),
      analyticsService.getConversationStats(sellerId),
      analyticsService.getTopProducts(sellerId),
    ]);

    const revenue = revenueRaw.map((item) => ({
      name: daysMap[item._id.day - 1],
      value: item.revenue,
    }));

    const orders = ordersRaw.map((item) => ({
      name: daysMap[item._id.day - 1],
      value: item.count,
    }));

    const topProducts = topProductsRaw.map((item, index) => ({
      id: item._id,
      name: item.product?.name || "Unknown",
      image: item.product?.images?.[0]?.url || "",
      sales: item.totalSales,
      revenue: item.revenue,
      rank: index + 1,
    }));

    res.json({
      success: true,
      data: {
        overview,
        revenue,
        orders,
        funnel,
        conversations,
        topProducts,
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