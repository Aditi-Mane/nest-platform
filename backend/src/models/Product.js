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
      enum: [
        "Study Material",
        "Electronics",
        "Fashion",
        "Hostel Essentials",
        "Handmade",
        "Sports",
        "Services",
        "Other"
      ],
      required: true,
      enum: [
          "Study Material",
          "Electronics",
          "Fashion",
          "Hostel Essentials",
          "Handmade",
          "Sports",
          "Services",
          "Other"
      ],

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

    whatsIncluded: {
     type: [String],
     default: [],
    },
    //Seller
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    //Product's sentiment rating system => from ml-services (sentiment analyzer)
    sentimentRating: {
      type: Number, //0-5
      default: 0,
    },

    //No. of ratings
    ratingCount: {
      type: Number,
      default: 0,
    },

    //from ml-services (sentiment analyzer) --> from dashboard analytics
    sentimentBreakdown: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
    },

    // Product condition (New, Used)
    condition: {
      type: String,
      enum: ["New", "Used"],
      trim: true,
    },

    // Stock /  -> set by seller
    stock: {
      type: Number,
      default: 1,
    },

    // Location (useful for campus-based marketplace)-> set while creating listing
    location: {
      type: String,
      trim: true,
      default: "",
    },

    // Product status lifecycle (after order placed logic)
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
