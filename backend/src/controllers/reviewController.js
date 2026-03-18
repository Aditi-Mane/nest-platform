import Product from "../models/Product.js";
import Review from "../models/Review.js";
import axios from "axios";

export const createReview =async (req,res)=>{
try{
   const userId =req.user._id;
   const {productId, starRating, text} =req.body;

   const product =await Product.findById(productId);
    
   if(!product){
    return res.status(400).json({ message: " Product not found"});
   }
   const existingReview=await Review.findOne({
        product: productId,
        user: userId,
   });

   if (existingReview) {
      return res.status(400).json({
        message: "You already reviewed this product",
      });
    }

    //call ML sentiment API
    const sentimentRes =await axios.post(
      "http://localhost:8000/predict-sentiment",
      { text }
    );

    const sentiment = sentimentRes.data.sentiment;
    const confidence = sentimentRes.data.confidence;

    const review =await Review.create({
      product: productId,
       user: userId,
      text,
      starRating,
      sentiment,
      confidence,
    });

    
    product.reviewCount += 1;

    product.averageRating =
      (product.averageRating * (product.reviewCount - 1) + starRating) /
      product.reviewCount;

    if (sentiment === "positive") product.sentimentStats.positive += 1;
    if (sentiment === "neutral") product.sentimentStats.neutral += 1;
    if (sentiment === "negative") product.sentimentStats.negative += 1;

    await product.save();

    res.status(201).json({
      success: true,
      review,
    });

  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({
      message: "Error creating review",
    });

    }
};


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
      message: "Server error while fetching reviews"
    });
  }
};
