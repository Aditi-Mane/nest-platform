import Conversation from "../models/Conversation.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { getTransporter } from "../utils/mailer.js";

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

    const { page = 1, limit = 6 } = req.query;

    const products = await Product.find({ createdBy: sellerId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments({
      createdBy: sellerId,
    });

    return res.status(200).json({
      products,
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

    if(conversation.status === "deal_confirmed") {
      return res.status(400).json({
        message: "Deal already confirmed",
      });
    }

    const product = await Product.findById(conversation.productId);

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
    const orders = await Order.find({sellerId})
    .populate("productId", "name price images")
    .populate("buyerId", "name")
    .sort({createdAt: -1})

    return res.status(200).json({
      message: "Orders successfully fetched",
      orders
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
      return res.status(400).json({
        message: "OTP is required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order doesn't exist",
      });
    }

    //authorize seller
    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to verify this order",
      });
    }

    //check expiry
    if (!order.otp || !order.otpExpiry) {
      return res.status(400).json({
        message: "No OTP generated for this order",
      });
    }

    if (new Date(order.otpExpiry).getTime() < Date.now()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    //compare OTP
    const isValid = await bcrypt.compare(otp, order.otp);

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const product = await Product.findById(order.productId);

    if (product) {
      product.stock = product.stock - 1;

      if (product.stock <= 0) {
        product.status = "sold";
        product.stock = 0;
      }

      await product.save();
    }

    //update order after successful verification
    order.status = "otp_verified";
    order.otp = undefined;
    order.otpExpiry = undefined;

    await order.save();

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