import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Which product was purchased
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Buyer (who placed the order)
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Seller (owner of the product)
    seller: {
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

    //  Total amount paid
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

    //  Order status
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "paid",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
