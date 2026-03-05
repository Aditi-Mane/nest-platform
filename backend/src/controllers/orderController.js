import Order from  "../models/Order.js";

export const getMyPurchases =async(req,res)=>{
  try{
    const buyerId = req.user._id;

    const orders= await Order.find({
      buyerId,
      status: "otp_verified",
    })
    .populate({
      path: "productId",
      select: "name price images"
    })
    .populate({
      path: "sellerId",
      select: "name avatar"
    })
    .sort({ updatedAt: -1});

    res.status(200).json({
      message: "Purchases fetched",
      orders,
    });
  }catch(error){
    res.status(500).json({
      message: "Error fetching purchases",
      error: error.message,
    });
  }
};