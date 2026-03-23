import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/Order.js";
import Product from "../src/models/Product.js";
import User from "../src/models/User.js";

dotenv.config();

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to DB");

    const orders = await Order.find()
      .populate("productId", "name")
      .populate("buyerId", "name");

    for (const order of orders) {
      await Order.findByIdAndUpdate(order._id, {
        productName: order.productId?.name || "",
        buyerName: order.buyerId?.name || "",
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