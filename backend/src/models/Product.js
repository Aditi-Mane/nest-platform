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
    },

    views: {
      type: Number,
      default: 0,
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
      averageRating: {
        type: Number,
        default: 0,
      },

      reviewCount: {
        type: Number,
        default: 0,
      },

      sentimentStats: {
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

//Create a search index on name and description fields
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
