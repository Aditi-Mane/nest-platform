import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    // Which product was purchased
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Buyer (who placed the order)
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    buyerName: {
      type: String,
      required: true,
    },

    // Seller (owner of the product)
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    //  Quantity purchased
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    pricePerItem: {
      type: Number,
      required: true
    },

    //  Total amount paid(optional)
    totalPrice: {
      type: Number,
      required: true,
    },

    // Payment info (optional for later)
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "cod"],
      default: "upi",
    },

    status: {
      type: String,
      enum: ["pending","otp_generated", "otp_verified"],
      default: "pending",
    },

    otp: {
      type: String,
    },

    otpExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
