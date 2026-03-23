import Conversation from "../models/Conversation.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js"
import Product from "../models/Product.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { getTransporter } from "../utils/mailer.js";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import { paginate } from "../utils/paginate.js";

export const setupSeller = async (req, res) => {
  try {
    const userId = req.user._id;

    const { storeName, storeDescription, storeLocation, payoutUPI } = req.body;

    if (!storeName || !storeDescription || !storeLocation) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.role = "seller";
    user.sellerStatus = "active";

    user.storeName = storeName;
    user.storeDescription = storeDescription;
    user.storeLocation = storeLocation;
    user.payoutUPI = payoutUPI;

    if (req.file) {
      user.storeLogo = `/uploads/${req.file.filename}`;
    }

    await user.save();

    return res.status(200).json({
      message: "Seller Setup successful"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

//create product
export const createProduct = async (req, res) => {
  try {
    
    const user = req.user;

    const {
      name,
      description,
      category,
      price,
      stock,
      condition,
      whatsIncluded
    } = req.body;

    //basic validation
    if(!name || !description || !category || !price) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    if(Number(price) <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    if(stock && Number(stock) < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative",
      });
    }

    let includedItems = [];
    if (whatsIncluded) {
      try {
        const parsed = JSON.parse(whatsIncluded);

        if (Array.isArray(parsed)) {
          includedItems = parsed.filter(
            (item) => typeof item === "string" && item.trim() !== ""
          );
        }
      } catch {
        includedItems = [];
      }
    }

    //handle uploaded images
    const imageUrls = req.files?.map((file) => ({
      url: `${req.protocol}://${req.get("host")}/${file.path}`,
    })) || [];

    if (imageUrls.length === 0) {
      return res.status(400).json({
        message: "At least one image is required",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price: Number(price),
      images: imageUrls,
      condition: condition,
      stock: stock ? Number(stock) : 1,
      location: user.storeLocation || "",
      createdBy: user._id,
      status: stock === 0 ? "sold" : "available",
      whatsIncluded: includedItems
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({
      message: "Server error while creating product",
    });
  }
};

//get all seller products
export const getMyProducts = async (req, res) =>{
  try {
    const sellerId = req.user._id;

    const { category, sort, search } = req.query;

    let sortOption = { createdAt: -1 }; // default = latest

    switch (sort) {
      case "latest":
        sortOption = { createdAt: -1 };
        break;

      case "rating":
        sortOption = { averageRating: -1 };
        break;

      case "views":
        sortOption = { views: -1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    //base query
    let queryObj = { createdBy: sellerId };

    //apply filter
    if (category && category !== "all") {
      queryObj.category = category;
    }

    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    let query = Product.find(queryObj)
      .sort(sortOption);

    //apply pagination
    const { query: paginatedQuery, page, limit } = paginate(query, req.query);

    const products = await paginatedQuery;

    const total = await Product.countDocuments({
      createdBy: sellerId,
    });

    return res.status(200).json({
      data: products,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching seller products",
    });
  }
}

//edit product info
export const editProduct = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const productId = req.params.id;

    const {
      name,
      description,
      category,
      price,
      stock,
      condition,
      existingImages, 
      whatsIncluded
    } = req.body;

    //find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    //ownership check
    if (product.createdBy.toString() !== sellerId.toString()) {
      return res.status(403).json({
        message: "Not authorized to edit this product"
      });
    }

    if (stock !== undefined && Number(stock) >= 0) {
      product.stock = Number(stock);

      if (product.stock === 0) {
        product.status = "sold";
      } else {
        product.status = "available";
      }
    }

    //update basic fields
    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (category) product.category = category;
    if (price && Number(price) > 0)
      product.price = Number(price);
    if (stock !== undefined && Number(stock) >= 0)
      product.stock = Number(stock);
    if (condition) product.condition = condition;

    if (whatsIncluded !== undefined) {
      try {
        const parsed =
          typeof whatsIncluded === "string"
            ? JSON.parse(whatsIncluded)
            : whatsIncluded;

        if (Array.isArray(parsed)) {
          product.whatsIncluded = parsed
            .map((item) => item?.toString().trim())
            .filter((item) => item !== "");
        }
      } catch (err) {
        console.error("Invalid whatsIncluded format:", err);
      }
    }

    //image Handling

    let updatedImages = [];

    //handle existing images (remaining ones)
    if (existingImages) {
      let parsedExisting = existingImages;

      if (!Array.isArray(parsedExisting)) {
        parsedExisting = [parsedExisting];
      }

      updatedImages = parsedExisting.map((url) => ({ url }));
    }

    //handle newly uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: `${req.protocol}://${req.get("host")}/${file.path.replace(/\\/g, "/")}`
      }));

      updatedImages = [...updatedImages, ...newImages];
    }

    //if no image changes sent → keep old images
    if (!existingImages && (!req.files || req.files.length === 0)) {
      updatedImages = product.images;
    }

    //ensure at least one image remains
    if (!updatedImages || updatedImages.length === 0) {
      return res.status(400).json({
        message: "At least one product image is required"
      });
    }

    product.images = updatedImages;

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product
    });

  } catch (error) {
    console.error("EDIT PRODUCT ERROR:", error);
    return res.status(500).json({
      message: "Server error while updating product"
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    //ensure seller owns this product
    if (product.createdBy.toString() !== sellerId.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this product",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      message: "Product deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error while deleting product",
    });
  }
};

export const confirmDeal = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { quantity, pricePerItem, paymentMethod } = req.body;

    const quantityNum = Number(quantity);
    const priceNum = Number(pricePerItem);
    const totalPrice = quantityNum * priceNum;

    const conversation = await Conversation.findById(conversationId);
    if(!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }
    if (["cancelled", "completed"].includes(conversation.status)) {
      return res.status(400).json({
        message: "This conversation is no longer active"
      });
    }

    if(conversation.status === "deal_confirmed") {
      return res.status(400).json({
        message: "Deal already confirmed",
      });
    }

    const product = await Product.findById(conversation.productId);
    const buyer = await Product.findById(conversation.buyerId);

    if(!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    //check if order already exists
    const existingOrder = await Order.findOne({ conversationId });

    if (existingOrder) {
      return res.status(400).json({
        message: "Order already exists for this deal",
      });
    }

    //check stock
    if (product.stock < quantityNum) {
      return res.status(400).json({
        message: "Not enough stock available"
      });
    }

    //create order
    const order = await Order.create({
      conversationId: conversation._id,
      productId: conversation.productId,
      buyerId: conversation.buyerId,
      sellerId: conversation.sellerId,
      quantity: quantityNum,
      pricePerItem: priceNum,
      productName: product.name,   
      buyerName: buyer.name, 
      totalPrice,
      paymentMethod
    });

    //reduce stock
    product.stock -= quantityNum;

    if (product.stock === 0) {
      product.status = "reserved";
    }

    await product.save();

    //update conversation
    conversation.status = "deal_confirmed";
    await conversation.save();

    return res.status(201).json({
      message: "Deal confirmed and order created",
      order
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const cancelDeal = async (req, res) =>{
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if(!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }
    if (["cancelled", "completed"].includes(conversation.status)) {
      return res.status(400).json({
        message: "This conversation is no longer active"
      });
    }

    if(conversation.status === "cancelled") {
      return res.status(400).json({
        message: "Deal already cancelled",
      });
    }

    //delete existing order
    const existingOrder = await Order.findOne({ conversationId })

    // restore stock if order exists
    if(existingOrder) {
      const product = await Product.findById(conversation.productId);

      if(product) {
        product.stock += existingOrder.quantity;

        if(product.stock > 0) {
          product.status = "available";
        }

        await product.save();
      }

      //delete order
      await Order.deleteOne({ _id: existingOrder._id });
    }

    //update conversation status
    conversation.status = "cancelled";
    await conversation.save();

    return res.status(200).json({
      message: "Deal cancelled",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
}

export const getSellerOrders = async (req, res) =>{
  try {
    const sellerId = req.user._id;

    const { status, search } = req.query;

    //build query object
    let queryObj = { sellerId };

    //apply status filter
    if (status && status !== "all") {
      queryObj.status = status;
    }

    if (search) {
      queryObj.$or = [
        { productName: { $regex: search, $options: "i" } },
        { buyerName: { $regex: search, $options: "i" } }
      ];
    }

    let query = Order.find(queryObj)
      .populate("productId", "name price images")
      .populate("buyerId", "name")
      .sort({ createdAt: -1 });

    //apply pagination
    const { query: paginatedQuery, page, limit } = paginate(query, req.query);

    const orders = await paginatedQuery;

    //total count
    const total = await Order.countDocuments({ sellerId });

    return res.status(200).json({
      message: "Orders successfully fetched",
      data: orders,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.log(error);
    
    return res.status(500).json({
      message: "Server error in fetching orders",
    });
  }
}

export const generateOrderOtp = async (req, res) => {
  try {
    const transporter = getTransporter();
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("buyerId", "email");

    if(!order) {
      return res.status(404).json({
        message: "Order doesn't exist",
      });
    }

    //authorize seller
    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    //prevent regenerating active OTP
    if(order.otp && new Date(order.otpExpiry).getTime() > Date.now()) {
      return res.status(400).json({
        message: "OTP already active",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000);

    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    order.otp = hashedOtp;
    order.otpExpiry = otpExpiry;
    order.status = "otp_generated";

    await order.save();

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: order.buyerId.email,
      subject: "Order Delivery Confirmation OTP - NEST",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Order Delivery Confirmation</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 2 minutes.</p>
          <p>If you did not request this, ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "OTP sent to buyer email",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error in generating OTP",
    });
  }
};

export const verifyOrderOtp = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order doesn't exist" });
    }

    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!order.otp || !order.otpExpiry) {
      return res.status(400).json({ message: "No OTP generated" });
    }

    // OTP expired
    if (new Date(order.otpExpiry).getTime() < Date.now()) {

      const conversation = await Conversation.findById(order.conversationId);
      const product = await Product.findById(order.productId);

      if (conversation) {
        conversation.status = "negotiating";
        await conversation.save();
      }

      if (product) {
        product.stock += order.quantity;
        product.status = "available";
        await product.save();
      }

      await Order.deleteOne({ _id: order._id });

      return res.status(400).json({
        message: "OTP expired. Deal reset.",
      });
    }

    const isValid = await bcrypt.compare(otp, order.otp);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Complete order
    order.status = "otp_verified";
    order.otp = undefined;
    order.otpExpiry = undefined;

    await order.save();

    const product = await Product.findById(order.productId);

    if (product) {
      if (product.stock === 0) {
        product.status = "sold";
      } else {
        product.status = "available";
      }

      await product.save();
    }

    await Cart.updateOne(
      { user: order.buyerId },
      { $pull: { items: { product: order.productId } } }
    );

    const conversation = await Conversation.findById(order.conversationId);

    if (conversation) {
      conversation.status = "completed";
      await conversation.save();
    }

    return res.status(200).json({
      message: "OTP verified successfully. Order completed.",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error in verifying OTP",
    });
  }
};
export const getSellerAnalytics = async (req, res) =>{
  try {
    const analytics = await Order.aggregate([
      {
        $match: {
          sellerId: new mongoose.Types.ObjectId(req.user.id),
          status: "otp_verified"
        }
      },
      {
        $group: {
          _id: "$productId",
          revenue: { $sum: "$totalPrice"},
          sales: { $sum: "$quantity"}
        }
      }
    ])

    const totalRevenue = analytics.reduce(
      (sum, item) => sum + item.revenue,
      0
    );

    return res.status(200).json({
      message: "Seller Analytics fetched successfully",
      totalRevenue,
      products: analytics.map(item => ({
        productId: item._id,
        revenue: item.revenue,
        sales: item.sales
      }))
    })

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    })
  }
}

export const getAverageRating = async (req, res) =>{
  try {
    const ratings = await Review.aggregate([
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$starRating"},
          totalReviews: { $sum: 1 }
        }
      }
    ])

    const productRatings = ratings.map(item => ({
      productId: item._id,
      avgRating: Number(item.avgRating.toFixed(1)),
      totalReviews: item.totalReviews
    }))

    const overall = await Review.aggregate([
      {
        $group: {
          _id: null,
          overallRating: { $avg: "$starRating" },
        }
      }
    ]);

    res.status(200).json({
      overallRating: overall[0]?.overallRating || 0,
      products: productRatings
    });

    
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    })
  }
}

export const getEarnings = async (req, res) => {
  try {
    const now = new Date();

    //today start (midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    //yesterday start
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);

    //tomorrow start (to cap today's range)
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const earnings = await Order.aggregate([
      {
        $match: {
          status: "otp_verified",
          createdAt: {
            $gte: yesterdayStart,
            $lt: tomorrowStart,
          },
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gte: ["$createdAt", todayStart] },
              "today",
              "yesterday",
            ],
          },
          totalEarnings: { $sum: "$totalPrice" },
        },
      },
    ]);

    //convert array to object
    const result = {
      today: 0,
      yesterday: 0,
    };

    earnings.forEach((item) => {
      result[item._id] = item.totalEarnings;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching earnings" });
  }
};

export const getPendingEarnings = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id); 

    const result = await Order.aggregate([
      {
        $match: {
          status: "pending",
          sellerId: sellerId, //important for seller-specific data
        },
      },
      {
        $group: {
          _id: null,
          totalPendingAmount: { $sum: "$totalPrice" },
          totalPendingOrders: { $sum: 1 },
        },
      },
    ]);

    //default response if no pending orders
    const response = {
      totalPendingAmount: 0,
      totalPendingOrders: 0,
    };

    if (result.length > 0) {
      response.totalPendingAmount = result[0].totalPendingAmount;
      response.totalPendingOrders = result[0].totalPendingOrders;
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching pending earnings" });
  }
};

export const getNegotiatingConversations = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    const result = await Conversation.aggregate([
      {
        $match: {
          status: "negotiating",
          sellerId: sellerId,
        },
      },
      {
        $lookup: {
          from: "products", 
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: null,
          totalPotentialAmount: { $sum: "$product.price" }, // 🔥 key part
          totalConversations: { $sum: 1 },
        },
      },
    ]);

    const response = {
      totalPotentialAmount: 0,
      totalConversations: 0,
    };

    if (result.length > 0) {
      response.totalPotentialAmount = result[0].totalPotentialAmount;
      response.totalConversations = result[0].totalConversations;
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching negotiation data" });
  }
};

export const getWeeklyEarnings = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    const now = new Date();

    //get current day (0 = Sunday, 1 = Monday...)
    const day = now.getDay();

    //convert Sunday (0) to 7 for easier calc
    const adjustedDay = day === 0 ? 7 : day;

    //start of THIS week (Monday)
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - (adjustedDay - 1));
    startOfThisWeek.setHours(0, 0, 0, 0);

    //start of LAST week
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    //end of LAST week
    const endOfLastWeek = new Date(startOfThisWeek);

    const result = await Order.aggregate([
      {
        $match: {
          status: "otp_verified",
          sellerId: sellerId,
          createdAt: {
            $gte: startOfLastWeek,
            $lt: now,
          },
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gte: ["$createdAt", startOfThisWeek] },
              "thisWeek",
              "lastWeek",
            ],
          },
          totalEarnings: { $sum: "$totalPrice" },
        },
      },
    ]);

    const response = {
      thisWeek: 0,
      lastWeek: 0,
    };

    result.forEach((item) => {
      response[item._id] = item.totalEarnings;
    });

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching weekly earnings" });
  }
};

export const getDailyEarnings = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const result = await Order.aggregate([
      {
        $match: {
          status: "otp_verified",
          sellerId: sellerId,
          createdAt: {
            $gte: sevenDaysAgo,
            $lte: today,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          amount: { $sum: "$totalPrice" },
        },
      },
    ]);

    //fill missing days 
    const daysMap = {};

    result.forEach((item) => {
      daysMap[item._id] = item.amount;
    });

    const finalData = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);

      const key = date.toISOString().split("T")[0];

      finalData.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        amount: daysMap[key] || 0,
      });
    }

    res.json(finalData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching daily earnings" });
  }
};

export const getTopProductThisWeek = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    const now = new Date();
    const day = now.getDay();
    const adjustedDay = day === 0 ? 7 : day;

    //start of this week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (adjustedDay - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const result = await Order.aggregate([
      {
        $match: {
          status: "otp_verified",
          sellerId: sellerId,
          createdAt: { $gte: startOfWeek },
        },
      },

      //group by product
      {
        $group: {
          _id: "$productId",
          totalSales: { $sum: "$quantity" },
          totalRevenue: { $sum: "$totalPrice" },
          avgPrice: { $avg: "$pricePerItem" },
        },
      },

      //sort by revenue (top performer)
      { $sort: { totalRevenue: -1 } },

      //only top 1
      { $limit: 1 },

      //join product data
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      { $unwind: "$product" },

      //final shape
      {
        $project: {
          _id: 0,
          name: "$product.name",
          image: { $arrayElemAt: ["$product.images.url", 0] }, // first image
          revenue: "$totalRevenue",
          price: "$avgPrice",
          sales: "$totalSales",
        },
      },
    ]);

    //handle no sales case
    const response = result.length > 0 ? result[0] : null;

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching top product" });
  }
};

export const incrementViews = async (req, res) => {
  try {
    const { productId } = req.params;

    await Product.findByIdAndUpdate(productId, {
      $inc: { views: 1 },
    });

    res.json({ message: "View counted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating views" });
  }
};

export const getInsights = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    const result = await Product.aggregate([
      {
        $match: {
          createdBy: sellerId,
        },
      },
      {
        $lookup: {
          from: "conversations",
          localField: "_id",
          foreignField: "productId",
          as: "conversations",
        },
      },
      {
        $addFields: {
          inquiries: {
            $size: {
              $filter: {
                input: "$conversations",
                as: "conv",
                cond: {
                  $in: [
                    { $toLower: "$$conv.status" }, //robust check
                    ["initiated", "negotiating"],
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1, // 🔥 IMPORTANT
          name: 1,
          views: 1,
          inquiries: 1,
          image: {
            $ifNull: [{ $arrayElemAt: ["$images.url", 0] }, null],
          },
        },
      },
      { $sort: { views: -1 } },
    ]);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching insights" });
  }
};

export const getSellerAverageRating = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    // Step 1: get products created by seller
    const products = await Product.find({ createdBy: sellerId }).select("_id");

    const productIds = products.map(p => p._id);

    // Step 2: aggregate reviews
    const stats = await Review.aggregate([
      {
        $match: {
          product: { $in: productIds }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$starRating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      avgRating: stats[0]?.avgRating?.toFixed(1) || 0,
      totalReviews: stats[0]?.totalReviews || 0
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};