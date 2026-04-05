import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";
import ProductView from "../models/ProductView.js";

const IST_TIMEZONE = "Asia/Kolkata";

const getDateFilter = (range) => {
  const now = new Date();

  if (range === "7d") {
    const past = new Date();
    past.setDate(now.getDate() - 6);
    return { $gte: past, $lte: now };
  }

  if (range === "30d") {
    const past = new Date();
    past.setDate(now.getDate() - 29);
    return { $gte: past, $lte: now };
  }

  return {}; // default → all time
};

const buildDailySeries = (range, valueKey) => {
  const now = new Date();
  const totalDays = range === "30d" ? 30 : 7;
  const start = new Date(now);

  start.setDate(now.getDate() - (totalDays - 1));
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      _id: {
        date: date.toLocaleDateString("en-CA", {
          timeZone: IST_TIMEZONE,
        }),
      },
      [valueKey]: 0,
    };
  });
};

const mergeDailySeries = (series, data, valueKey) => {
  const valuesByDate = new Map(
    data.map((item) => [item._id.date, item[valueKey] || 0])
  );

  return series.map((item) => ({
    ...item,
    [valueKey]: valuesByDate.get(item._id.date) || 0,
  }));
};

export const getOverviewStats = async (sellerId, range) => {
  const dateFilter = getDateFilter(range);

  const baseMatch = {
    sellerId,
    ...(range && { createdAt: dateFilter }),
  };

  const revenueMatch = {
    ...baseMatch,
    status: "otp_verified", 
  };

  const [revenueAgg, totalOrders, totalConversations] =
    await Promise.all([
 
      Order.aggregate([
        { $match: revenueMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
          },
        },
      ]),

      Order.countDocuments(baseMatch),

      Conversation.countDocuments({ sellerId }),
    ]);

  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

  return {
    totalRevenue,
    totalOrders,
    totalConversations,
    avgOrderValue:
      totalOrders > 0 ? totalRevenue / totalOrders : 0,
  };
};

/* ---------------- REVENUE TREND ---------------- */

export const getRevenueTrend = async (sellerId, range) => {
  const dateFilter = getDateFilter(range);

  const data = await Order.aggregate([
    {
      $match: {
        sellerId,
        status: "otp_verified",
        ...(range && { createdAt: dateFilter }),
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: IST_TIMEZONE,
            },
          },
        },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  return mergeDailySeries(buildDailySeries(range, "revenue"), data, "revenue");
};

export const getOrdersTrend = async (sellerId, range) => {
  const dateFilter = getDateFilter(range);

  const data = await Order.aggregate([
    {
      $match: {
        sellerId,
        ...(range && { createdAt: dateFilter }),
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: IST_TIMEZONE,
            },
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  return mergeDailySeries(buildDailySeries(range, "count"), data, "count");
};

/* ---------------- CONVERSION FUNNEL ---------------- */

export const getConversionFunnel = async (sellerId) => {
  const [
    viewsAgg,
    inquiries,
    totalOrders,
    pending,
    inProgress,
    completed,
  ] = await Promise.all([

    Product.aggregate([
      { $match: { createdBy: sellerId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ]),

    Conversation.countDocuments({ sellerId }),

    Order.countDocuments({ sellerId }),

    Order.countDocuments({
      sellerId,
      status: "pending",
    }),

    Order.countDocuments({
      sellerId,
      status: "otp_generated",
    }),

    Order.countDocuments({
      sellerId,
      status: "otp_verified",
    }),
  ]);

  return {
    views: viewsAgg[0]?.totalViews || 0,
    inquiries,
    orders: totalOrders,

    pending,
    inProgress,
    completed,
  };
};

/* ---------------- CONVERSATION STATS ---------------- */

export const getConversationStats = async (sellerId) => {
  const [total, active, confirmed, cancelled, completed] = await Promise.all([
    // total conversations
    Conversation.countDocuments({ sellerId }),

    Conversation.countDocuments({
      sellerId,
      status: { $in: ["initiated", "negotiating"] },
    }),

    Conversation.countDocuments({
      sellerId,
      status: "deal_confirmed",
    }),

    Conversation.countDocuments({
      sellerId,
      status: "cancelled",
    }),

    Conversation.countDocuments({
      sellerId,
      status: "completed",
    }),
  ]);

  return {
    total,
    active,
    confirmed,
    cancelled,
    completed
  };
};

/* ---------------- TOP PRODUCTS ---------------- */

export const getTopProducts = async (sellerId) => {
  return await Order.aggregate([
    {
      $match: {
        sellerId: new mongoose.Types.ObjectId(sellerId),
        status: "otp_verified",
      },
    },

    {
      $group: {
        _id: "$productId",
        totalSales: { $sum: "$quantity" },
        revenue: { $sum: "$totalPrice" },
      },
    },

    { $sort: { revenue: -1 } },
    { $limit: 5 },

    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },

    {
      $unwind: {
        path: "$product",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);
};

export const getViewsTrend = async (sellerId, range) => {
  const dateFilter = getDateFilter(range);

  // get all seller products
  const products = await Product.find(
    { createdBy: sellerId },
    { _id: 1 }
  );

  const productIds = products.map((p) => p._id);

  // aggregate from ProductView
  const data = await ProductView.aggregate([
    {
      $match: {
        productId: { $in: productIds },
        ...(range && { date: dateFilter }),
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
              timezone: IST_TIMEZONE,
            },
          },
        },
        views: { $sum: "$views" },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  return mergeDailySeries(buildDailySeries(range, "views"), data, "views");
};

export const getLowProducts = async (sellerId) => {
  return await Product.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(sellerId),
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "productId",
        as: "orders",
      },
    },
    {
      $addFields: {
        sales: {
          $sum: {
            $map: {
              input: "$orders",
              as: "o",
              in: "$$o.quantity",
            },
          },
        },
      },
    },
    {
      $addFields: {
        conversionRate: {
          $cond: [
            { $gt: ["$views", 0] },
            { $multiply: [{ $divide: ["$sales", "$views"] }, 100] },
            0,
          ],
        },
      },
    },
    {
      $project: {
        name: 1,
        images: 1,
        views: { $ifNull: ["$views", 0] },
        sales: 1,
        conversionRate: 1,
      },
    },
    { $sort: { conversionRate: 1 } },
    { $limit: 5 },
  ]);
};
 