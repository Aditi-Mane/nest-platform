import mongoose from "mongoose";

const productSchema =new mongoose.Schema(
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

    category:{
      type: String,
      required: true,
      trim: true,
    },

    price:{
      type: Number,
      required: true,
      default: 1,
    },

    images:[
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

    // ⭐ AI Sentiment Rating System
    sentimentRating: {
      type: Number,
      default: 0, // rating from 1–5 computed automatically
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

  },
  {timestamp: true}
);

const Product=mongoose.model("Product", productSchema);
export default Product;