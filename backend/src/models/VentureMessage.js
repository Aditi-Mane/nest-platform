import mongoose from "mongoose";

const { Schema } = mongoose;

const VentureMessageSchema = new Schema(
  {
    venture: {
      type: Schema.Types.ObjectId,
      ref: "Venture",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      maxlength: 1000,
    },

    messageType: {
      type: String,
      enum: ["text", "system"],
      default: "text",
    },

    // For system messages like "X joined team"
    meta: {
      type: Object,
      default: null,
    },

    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Index for fast chat loading
VentureMessageSchema.index({ venture: 1, createdAt: -1 });

export default mongoose.model("VentureMessage", VentureMessageSchema);