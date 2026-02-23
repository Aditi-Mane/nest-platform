import mongoose from "mongoose";

const conversationSchema =new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sellerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["initiated", "negotiating", "deal_confirmed", "cancelled"],
      default: "initiated",
    },

    lastMessage: {
      type: String,
      default: "",
    },


  },
  { timestamps: true }
);

const Conversation =mongoose.model("Conversation", conversationSchema);
export default Conversation;
