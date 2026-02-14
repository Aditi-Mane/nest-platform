import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    //AI sentiment rating system
    sentimentRating: {
      type: Number, //0-5
      default: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
    },

    sentimentBreakdown: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
    },

    // Product condition (New, Used, Like New, etc.)
    condition: {
      type: String,
      default: "Good",
      trim: true,
    },

    // Stock / availability
    stock: {
      type: Number,
      default: 1,
    },

    // Location (useful for campus-based marketplace)
    location: {
      type: String,
      trim: true,
      default: "",
    },

    // Product status lifecycle
    status: {
      type: String,
      enum: ["available", "sold", "reserved"],
      default: "available",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
