import mongoose from "mongoose";
import dotenv from "dotenv";
import Conversation from "../src/models/Conversation.js";
import Product from "../src/models/Product.js";
import User from "../src/models/User.js";

dotenv.config();

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to DB");

    const conversations = await Conversation.find()
      .populate("productId", "name")
      .populate("buyerId", "name");

    for (const conversation of conversations) {
      await Conversation.findByIdAndUpdate(conversation._id, {
        productName: conversation.productId?.name || "",
        buyerName: conversation.buyerId?.name || "",
      });
    }

    console.log("Migration completed ✅");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMigration();