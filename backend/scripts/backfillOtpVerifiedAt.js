import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/Order.js";

dotenv.config();

const backfillOtpVerifiedAt = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to DB");

    const result = await mongoose.connection.db
    .collection("orders")
    .updateMany(
      {
        status: "otp_verified",
        $or: [
          { otpVerifiedAt: { $exists: false } },
          { otpVerifiedAt: null },
        ],
      },
      [
        {
          $set: {
            otpVerifiedAt: "$createdAt",
          },
        },
      ]
    );

    console.log(`Matched: ${result.matchedCount}, Updated: ${result.modifiedCount}`);
    console.log("Backfill completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Backfill failed", error);
    process.exit(1);
  }
};

backfillOtpVerifiedAt();
