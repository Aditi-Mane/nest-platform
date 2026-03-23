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

    productName: {
      type: String,
      required: true,
    },

    buyerName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "initiated",
        "negotiating",
        "deal_confirmed",
        "cancelled",
        "completed"
      ],
      default: "initiated",
    },
    
    lastMessage: {
      type: String,
      default: "",
    },

    unreadCountSeller: {
      type: Number,
      default: 0
    },

    unreadCountBuyer: {
      type: Number,
      default: 0
    }

  },
  { timestamps: true }
);
conversationSchema.index(
  { productId: 1, buyerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["initiated", "negotiating", "deal_confirmed"] }
    }
  }
);
const Conversation =mongoose.model("Conversation", conversationSchema);

export default Conversation;
