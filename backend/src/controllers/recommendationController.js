import axios from "axios";
import Product from "../models/Product.js";

export const getMLRecommendations = async (req, res) => {
  try {
    const { id } = req.params;

    const currentProduct = await Product.findById(id);

    if (!currentProduct || currentProduct.status === "deleted") {
      return res.status(404).json({ message: "Product not found" });
    }

    // 1️⃣ Get candidate products
    const candidates = await Product.find({
      _id: { $ne: id },
      category: currentProduct.category,
      status: "available",
    }).limit(20);

    // ⚠️ If no candidates → return early
    if (!candidates.length) {
      return res.json({ recommendations: [] });
    }

    // 2️⃣ Prepare ML input
    const queryText = `
      ${currentProduct.name}
      ${currentProduct.description}
      ${currentProduct.category}
    `;

    const productsForML = candidates.map((p) => ({
      id: p._id.toString(),
      text: `${p.name} ${p.description} ${p.category}`,
    }));

    let rankedProducts = [];

    try {
      //Call ML service
      const mlRes = await axios.post(
        "http://recommender-service:8001/recommend",
        {
          query: queryText,
          products: productsForML,
        },
        { timeout: 5000 }
      );

      // Validate ML response
      if (!mlRes.data || !mlRes.data.results) {
        throw new Error("Invalid ML response");
      }

      const rankedIds = mlRes.data.results.map((r) => r.id);

      //Map IDs → products safely
      rankedProducts = rankedIds
        .map((rid) =>
          candidates.find((p) => p._id.toString() === rid)
        )
        .filter(Boolean); //remove undefined

    } catch (mlError) {
      console.error(" ML failed → using fallback:", mlError.message);

      //Fallback → simple ranking
      rankedProducts = candidates.sort((a, b) => {
        return (
          (b.averageRating || 0) - (a.averageRating || 0) ||
          (b.reviewCount || 0) - (a.reviewCount || 0)
        );
      });
    }

    // Final response
    res.json({
      success: true,
      recommendations: rankedProducts.slice(0, 6),
    });

  } catch (error) {
    console.error(" ML recommendation error:", error);
    res.status(500).json({
      message: "ML recommendation failed",
    });
  }
};

export const recommendFromCart = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || productIds.length === 0) {
      return res.json({ recommendations: [] });
    }

    //Get cart products
    const cartProducts = await Product.find({
      _id: { $in: productIds },
      status: { $ne: "deleted" },
    });

    // Extract categories
    const categories = [...new Set(cartProducts.map(p => p.category))];

    // Fetch similar products
    const candidates = await Product.find({
      category: { $in: categories },
      _id: { $nin: productIds }, // exclude already in cart
      status: "available"
    })
      .sort({
        averageRating: -1,   //  better products first
        reviewCount: -1      //  popular products
      })
      .limit(5);

    res.json({
      success: true,
      recommendations: candidates
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get recommendations" });
  }
};
