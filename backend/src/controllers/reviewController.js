import Product from "../models/Product.js";
import Review from "../models/Review.js";
import axios from "axios";

const SENTIMENT_SERVICE_URL =
  process.env.SENTIMENT_SERVICE_URL || "http://localhost:8001/predict-sentiment";

const analyzeSentiment = async (text) => {
  try {
    const sentimentRes = await axios.post(
      SENTIMENT_SERVICE_URL,
      { text },
      { timeout: 5000 }
    );

    return {
      sentiment: sentimentRes.data?.sentiment ?? null,
      confidence: sentimentRes.data?.confidence ?? null,
    };
  } catch (error) {
    console.warn(
      "Sentiment service unavailable. Saving review without sentiment analysis.",
      error.message
    );

    return {
      sentiment: null,
      confidence: null,
    };
  }
};

export const createReview =async (req,res)=>{
try{
   const userId = req.user?._id;
   const { productId, starRating, text } = req.body;

   if (!userId) {
    return res.status(401).json({ message: "Not authorized" });
   }

   if (!productId || !text?.trim()) {
    return res.status(400).json({
      message: "Product and review text are required",
    });
   }

   if (!Number.isInteger(starRating) || starRating < 1 || starRating > 5) {
    return res.status(400).json({
      message: "Star rating must be an integer between 1 and 5",
    });
   }

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

    const { sentiment, confidence } = await analyzeSentiment(text.trim());

    const review =await Review.create({
      product: productId,
       user: userId,
      text: text.trim(),
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
      .populate("product", "name")
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

// export const getProductSentiment = async (req, res) => {
//   try {
//     const products = await Review.aggregate([
//       {
//         $group: {
//           _id: "$product",
//           positive: {
//             $sum: { $cond: [{ $eq: ["$sentiment", "positive"] }, 1, 0] }
//           },
//           neutral: {
//             $sum: { $cond: [{ $eq: ["$sentiment", "neutral"] }, 1, 0] }
//           },
//           negative: {
//             $sum: { $cond: [{ $eq: ["$sentiment", "negative"] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     res.status(200).json({
//       success: true,
//       products,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Error fetching product sentiment",
//     });
//   }
// };

// export const getProductSentiment = async (req, res) => {
//   try {
//     const products = await Review.aggregate([
//       {
//         $group: {
//           _id: "$product",
//           positive: {
//             $sum: { $cond: [{ $eq: ["$sentiment", "positive"] }, 1, 0] }
//           },
//           neutral: {
//             $sum: { $cond: [{ $eq: ["$sentiment", "neutral"] }, 1, 0] }
//           },
//           negative: {
//             $sum: { $cond: [{ $eq: ["$sentiment", "negative"] }, 1, 0] }
//           }
//         }
//       },
//       {
//         $lookup: {
//           from: "products",   // collection name in MongoDB
//           localField: "_id",
//           foreignField: "_id",
//           as: "productDetails"
//         }
//       },
//       {
//         $unwind: "$productDetails"
//       }
//     ]);

//     res.json(products);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error" });
//   }
// };

export const getProductSentimentBySeller = async (req, res) => {
  try {
    const sellerId = req.user._id;
    console.log("SELLER ID:", sellerId);

    const data = await Review.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },

      {
        $match: {
          "productDetails.createdBy": sellerId
        }
      },

      {
        $group: {
          _id: "$product",
          name: { $first: "$productDetails.name" },
          // image: { $first: { $arrayElemAt: ["$productDetails.images.url", 0] } },
          image: {
  $first: {
    $arrayElemAt: ["$productDetails.images", 0]
  }
},
          totalReviews: { $sum: 1 },

          positive: {
            $sum: { $cond: [{ $eq: ["$sentiment", "positive"] }, 1, 0] }
          },
          neutral: {
            $sum: { $cond: [{ $eq: ["$sentiment", "neutral"] }, 1, 0] }
          },
          negative: {
            $sum: { $cond: [{ $eq: ["$sentiment", "negative"] }, 1, 0] }
          }
        }
      }
    ]);

    // 👉 Convert to UI format
    const formatted = data.map((p) => {
      const total = p.totalReviews || 1;

      const pos = Math.round((p.positive / total) * 100);
      const neu = Math.round((p.neutral / total) * 100);
      const neg = Math.round((p.negative / total) * 100);

      const score = ((p.positive + p.neutral * 0.5) / total) * 10;

      return {
        name: p.name,
        image: p.image?.url, 
        totalReviews: p.totalReviews,
        positive: pos,
        neutral: neu,
        negative: neg, 
        score: score.toFixed(1)
      };
    });

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
};

export const getReviewInsights = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const reviews = await Review.find()
      .populate({
        path: "product",
        match: { createdBy: sellerId },
        select: "name"
      });

    // remove null products (not seller's)
    const filtered = reviews.filter(r => r.product !== null);

    const positive = filtered.filter(r => r.sentiment === "positive");
    const negative = filtered.filter(r => r.sentiment === "negative");

    res.json({
      positive: positive.map(r => r.text),
      negative: negative.map(r => r.text)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching insights" });
  }
};
