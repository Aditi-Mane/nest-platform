import Product from "../models/Product.js";
import Review from "../models/Review.js";
import axios from "axios";
import mongoose from "mongoose";

const SENTIMENT_PREDICT_PATH = "/predict-sentiment";

const normalizeSentimentServiceUrl = (rawUrl) => {
  const baseUrl = (rawUrl || "http://sentiment-service:8000").trim();
  if (baseUrl.endsWith(SENTIMENT_PREDICT_PATH)) return baseUrl;
  return `${baseUrl.replace(/\/+$/, "")}${SENTIMENT_PREDICT_PATH}`;
};

const SENTIMENT_SERVICE_URL = normalizeSentimentServiceUrl(
  process.env.SENTIMENT_SERVICE_URL
);

const inferSentimentFromRating = (starRating) => {
  if (starRating >= 4) return "positive";
  if (starRating <= 2) return "negative";
  return "neutral";
};

const buildEffectiveSentimentExpr = () => ({
  $switch: {
    branches: [
      {
        case: { $in: ["$sentiment", ["positive", "neutral", "negative"]] },
        then: "$sentiment",
      },
      {
        case: { $gte: ["$starRating", 4] },
        then: "positive",
      },
      {
        case: { $lte: ["$starRating", 2] },
        then: "negative",
      },
    ],
    default: "neutral",
  },
});

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "be",
  "been",
  "but",
  "by",
  "for",
  "from",
  "had",
  "has",
  "have",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "me",
  "my",
  "of",
  "on",
  "or",
  "our",
  "so",
  "that",
  "the",
  "their",
  "this",
  "to",
  "was",
  "were",
  "with",
  "you",
  "your",
]);

const formatTheme = (value) =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const extractThemes = (texts = []) => {
  const phraseCounts = new Map();
  const wordCounts = new Map();

  texts.forEach((text) => {
    const tokens = String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

    const uniqueWords = new Set(tokens);
    uniqueWords.forEach((word) => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });

    const uniquePhrases = new Set();
    for (let index = 0; index < tokens.length - 1; index += 1) {
      const first = tokens[index];
      const second = tokens[index + 1];
      if (!first || !second) continue;
      uniquePhrases.add(`${first} ${second}`);
    }

    uniquePhrases.forEach((phrase) => {
      phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
    });
  });

  const rankedPhrases = [...phraseCounts.entries()]
    .sort((left, right) => right[1] - left[1] || right[0].length - left[0].length)
    .map(([phrase]) => formatTheme(phrase));

  const rankedWords = [...wordCounts.entries()]
    .sort((left, right) => right[1] - left[1] || right[0].localeCompare(left[0]))
    .map(([word]) => formatTheme(word));

  return [...new Set([...rankedPhrases, ...rankedWords])].slice(0, 5);
};

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
      "Sentiment service unavailable. Falling back to rating-based sentiment.",
      error.message
    );
    return { sentiment: null, confidence: null };
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CREATE REVIEW                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

export const createReview = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { productId, starRating, text } = req.body;

    if (!userId)
      return res.status(401).json({ message: "Not authorized" });

    if (!productId || !text?.trim())
      return res.status(400).json({ message: "Product and review text are required" });

    if (!Number.isInteger(starRating) || starRating < 1 || starRating > 5)
      return res.status(400).json({ message: "Star rating must be an integer between 1 and 5" });

    const product = await Product.findById(productId);
    if (!product)
      return res.status(400).json({ message: "Product not found" });

    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview)
      return res.status(400).json({ message: "You already reviewed this product" });

    const { sentiment, confidence } = await analyzeSentiment(text.trim());
    const resolvedSentiment = sentiment ?? inferSentimentFromRating(starRating);

    const review = await Review.create({
      product: productId,
      user: userId,
      text: text.trim(),
      starRating,
      sentiment: resolvedSentiment,
      confidence,
    });

    product.reviewCount += 1;
    product.averageRating =
      (product.averageRating * (product.reviewCount - 1) + starRating) /
      product.reviewCount;

    if (resolvedSentiment === "positive") product.sentimentStats.positive += 1;
    if (resolvedSentiment === "neutral")  product.sentimentStats.neutral  += 1;
    if (resolvedSentiment === "negative") product.sentimentStats.negative += 1;

    await product.save();

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ message: "Error creating review" });
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  GET REVIEWS BY PRODUCT                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

export const getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate("user", "name avatar")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("error fetching reviews", error);
    res.status(500).json({ success: false, message: "Server error while fetching reviews" });
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SENTIMENT ANALYTICS  (new endpoint — the core fix)                        */
/*                                                                             */
/*  Root cause of zero data:                                                   */
/*    • Frontend called /analytics/overview which returns revenue/order        */
/*      stats, NOT sentiment fields. So overallScore / sentimentDistribution   */
/*      / trend were always undefined → rendered as 0.                         */
/*    • The Python /analytics endpoint read ALL reviews globally, not per-     */
/*      seller, giving wrong totals.                                           */
/*                                                                             */
/*  This endpoint is seller-scoped via auth middleware, uses the same          */
/*  Mongoose connection as every other route, and returns exactly the shape    */
/*  the SellerSentiment UI expects:                                            */
/*    { totalReviews, positiveRate, overallScore,                              */
/*      sentimentDistribution: {positive, neutral, negative},                  */
/*      trend: [{name: "YYYY-MM-DD", value: score}, ...] }                    */
/*                                                                             */
/*  Add this route in your reviewRouter:                                       */
/*    router.get("/sentiment-analytics", protect, getSentimentAnalytics);      */
/* ─────────────────────────────────────────────────────────────────────────── */

export const getSentimentAnalytics = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user._id);

    // ── 1. Overall sentiment counts for this seller ────────────────────────
    const [stats] = await Review.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      { $match: { "productDetails.createdBy": sellerId } },
      { $addFields: { effectiveSentiment: buildEffectiveSentimentExpr() } },
      {
        $group: {
          _id: null,
          total:    { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ["$effectiveSentiment", "positive"] }, 1, 0] } },
          neutral:  { $sum: { $cond: [{ $eq: ["$effectiveSentiment", "neutral"]  }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ["$effectiveSentiment", "negative"] }, 1, 0] } },
        },
      },
    ]);

    const { total = 0, positive = 0, neutral = 0, negative = 0 } = stats ?? {};
    const safeTotal = total || 1; // prevent division by zero

    const positiveRate = parseFloat(((positive / safeTotal) * 100).toFixed(2));
    const overallScore = parseFloat(
      (((positive + neutral * 0.5) / safeTotal) * 10).toFixed(2)
    );

    // ── 2. Day-wise trend – last 30 days ──────────────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendRaw = await Review.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $match: {
          "productDetails.createdBy": sellerId,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      { $addFields: { effectiveSentiment: buildEffectiveSentimentExpr() } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          dayTotal:    { $sum: 1 },
          dayPositive: { $sum: { $cond: [{ $eq: ["$effectiveSentiment", "positive"] }, 1, 0] } },
          dayNeutral:  { $sum: { $cond: [{ $eq: ["$effectiveSentiment", "neutral"]  }, 1, 0] } },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    const trend = trendRaw.map((item) => ({
      name: item._id.date,
      value: parseFloat(
        (((item.dayPositive + item.dayNeutral * 0.5) / item.dayTotal) * 10).toFixed(2)
      ),
    }));

    res.json({
      totalReviews: total,
      positiveRate,
      overallScore,
      sentimentDistribution: { positive, neutral, negative },
      trend,
    });
  } catch (err) {
    console.error("Sentiment analytics error:", err);
    res.status(500).json({ message: "Error fetching sentiment analytics" });
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PRODUCT SENTIMENT BY SELLER                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

export const getProductSentimentBySeller = async (req, res) => {
  try {
    // FIX: cast to ObjectId — string vs ObjectId comparison always returned 0 results
    const sellerId = new mongoose.Types.ObjectId(req.user._id);

    const data = await Review.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      { $match: { "productDetails.createdBy": sellerId } },
      { $addFields: { effectiveSentiment: buildEffectiveSentimentExpr() } },
      {
        $group: {
          _id: "$product",
          productId:     { $first: "$productDetails._id" },
          name:         { $first: "$productDetails.name" },
          image:        { $first: { $arrayElemAt: ["$productDetails.images", 0] } },
          productCreatedAt: { $first: "$productDetails.createdAt" },
          latestReviewAt: { $max: "$createdAt" },
          totalReviews: { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ["$effectiveSentiment", "positive"] }, 1, 0] } },
          neutral:  { $sum: { $cond: [{ $eq: ["$effectiveSentiment", "neutral"]  }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ["$effectiveSentiment", "negative"] }, 1, 0] } },
        },
      },
      { $sort: { productCreatedAt: -1, latestReviewAt: -1 } },
      { $limit: 5 },
    ]);

    const formatted = data.map((p) => {
      const total = p.totalReviews || 1;
      const score = ((p.positive + p.neutral * 0.5) / total) * 10;

      return {
        _id:          p.productId,
        name:         p.name,
        image:        p.image?.url,
        totalReviews: p.totalReviews,
        positive:     Math.round((p.positive / total) * 100),
        neutral:      Math.round((p.neutral  / total) * 100),
        negative:     Math.round((p.negative / total) * 100),
        score:        score.toFixed(1),
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching product sentiment" });
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  REVIEW INSIGHTS                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

const THEME_MAX_LEN = 80;
const truncate = (text) =>
  text.length <= THEME_MAX_LEN ? text : text.slice(0, THEME_MAX_LEN).trimEnd() + "…";

export const getReviewInsights = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user._id);

    const results = await Review.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $match: {
          "productDetails.createdBy": sellerId,
        },
      },
      { $addFields: { effectiveSentiment: buildEffectiveSentimentExpr() } },
      {
        $match: {
          effectiveSentiment: { $in: ["positive", "negative"] },
        },
      },
      // Most-confident reviews first so the top-5 are the most meaningful ones
      { $sort: { confidence: -1, createdAt: -1 } },
      {
        $group: {
          _id: "$effectiveSentiment",
          texts: { $push: "$text" },
        },
      },
    ]);

    const positiveEntry = results.find((r) => r._id === "positive");
    const negativeEntry = results.find((r) => r._id === "negative");
    const positiveThemes = extractThemes(positiveEntry?.texts ?? []);
    const negativeThemes = extractThemes(negativeEntry?.texts ?? []);

    res.json({
      positive:
        positiveThemes.length > 0
          ? positiveThemes
          : (positiveEntry?.texts ?? []).slice(0, 5).map(truncate),
      negative:
        negativeThemes.length > 0
          ? negativeThemes
          : (negativeEntry?.texts ?? []).slice(0, 5).map(truncate),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching insights" });
  }
};
