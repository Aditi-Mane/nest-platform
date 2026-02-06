import mongoose from "mongoose";

const reviewSchema=new mongoose.Schema(
  {
    product:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Product",
      required: true,

    },
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: null,
    },

    confidence: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);
const Review =mongoose.model("Review", reviewSchema);

export default Review;