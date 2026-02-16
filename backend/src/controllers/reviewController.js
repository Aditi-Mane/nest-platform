import Review from "../models/Review.js";

export const getReviewsByProduct = async (req, res) => {
  try {
    const productId = req.params.id; 
   
    const reviews = await Review.find({ product: productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log("error fetching reviews", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
    });
  }
};
