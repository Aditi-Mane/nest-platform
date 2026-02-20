import { MongoTopologyClosedError } from "mongodb"
import mongoose from "mongoose"

const cartSchema=new mongoose.Schema(
  {
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items:[
      {
        product:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quatity:{
          type: Number,
          default: 1,

        },
      },
    ],


  },
  {timestamps: true}
);

export default mongoose.model("Cart", cartSchema);