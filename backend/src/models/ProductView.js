import mongoose from "mongoose";

const productViewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    // normalized date (midnight)
    date: {
      type: Date,
      required: true,
      index: true
    },

    views: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// prevent duplicate entries for same product + same day
productViewSchema.index({ productId: 1, date: 1 }, { unique: true });

export default mongoose.model("ProductView", productViewSchema);