import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";

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
          day: {
            $dayOfWeek: {
              date: "$createdAt",
              timezone: "Asia/Kolkata", 
            },
          },
        },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { "_id.day": 1 } },
  ]);

  const fullWeek = [1, 2, 3, 4, 5, 6, 7];

  const revenueMap = {};
  data.forEach((item) => {
    revenueMap[item._id.day] = item.revenue;
  });

  const result = fullWeek.map((day) => ({
    _id: { day },
    revenue: revenueMap[day] || 0,
  }));

  return result;
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
          day: {
            $dayOfWeek: {
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.day": 1 } },
  ]);

  const fullWeek = [1, 2, 3, 4, 5, 6, 7];

  const countMap = {};
  data.forEach((item) => {
    countMap[item._id.day] = item.count;
  });

  const result = fullWeek.map((day) => ({
    _id: { day },
    count: countMap[day] || 0,
  }));

  return result;
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

  const data = await Product.aggregate([
    {
      $match: {
       createdBy: new mongoose.Types.ObjectId(String(sellerId)),
        ...(range && { createdAt: dateFilter }),
      },
    },
    {
      $group: {
        _id: {
          day: {
            $dayOfWeek: {
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
        },
        views: { $sum: { $ifNull: ["$views", 0] } },
      },
    },
    { $sort: { "_id.day": 1 } },
  ]);

  const fullWeek = [1, 2, 3, 4, 5, 6, 7];

  const map = {};
  data.forEach((item) => {
    map[item._id.day] = item.views;
  });

  return fullWeek.map((day) => ({
    _id: { day },
    views: map[day] || 0,
  }));
};

export const getLowProducts = async (sellerId) => {
  return await Product.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(String(sellerId))
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
            {
              $multiply: [
                { $divide: ["$sales", "$views"] },
                100,
              ],
            },
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