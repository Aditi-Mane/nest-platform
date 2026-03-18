import Order from  "../models/Order.js";
import Review from "../models/Review.js"

export const getMyPurchases =async(req,res)=>{
  try {
    const buyerId = req.user._id;

    const orders = await Order.find({
      buyerId,
      status: "otp_verified",

    })
      .populate("productId", "name images price")
      .populate("sellerId", "name")
      .sort({ updatedAt: -1 });

    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {

        const review = await Review.findOne({
          product: order.productId,
          user: buyerId
        });

        return {
          ...order.toObject(),
          reviewed: !!review
        };
      })
    );

    res.json({
      success: true,
      orders: ordersWithReviewStatus
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch purchases" });
  }
};