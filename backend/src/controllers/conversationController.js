import Conversation from "../models/Conversation.js";
import Product from "../models/Product.js";
import { paginate } from "../utils/paginate.js";

export const createConversation = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    const buyer = await Product.findById(buyerId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock <= 0 || product.status !== "available") {
      return res.status(400).json({ message: "Product not available" });
    }

    //check existing 
    const existingConversation = await Conversation.findOne({
      productId,
      buyerId,
      status: { $in: ["initiated", "negotiating", "deal_confirmed"] }
    });

    //If exists → reuse
    if (existingConversation) {
      return res.status(200).json({
        message: "Conversation already exists",
        conversation: existingConversation,
      });
    }

    //Create new only if none exists
    const conversation = await Conversation.create({
      productId,
      buyerId,
      sellerId: product.createdBy,
      productName: product.name,   
      buyerName: buyer.name, 
      status: "initiated",
    });

    res.status(200).json({
      message: "Conversation created",
      conversation,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBuyerConversations = async (req, res) => {
  try {
    const buyerId = req.user._id;

    const conversations = await Conversation.find({
      buyerId,
      status: { $ne: "completed" } //hide completed
    })
      .populate("productId", "name images price status") // ✅ fixed
      .populate("sellerId", "name avatar")
      .sort({ updatedAt: -1 }); 

    return res.status(200).json({
      message: "Fetched buyer conversations",
      conversations,
      
    });

  } catch (error) {
    console.error(error); 
    return res.status(500).json({
      message: "Error fetching buyer conversations",
      error: error.message, 
    });
  }
};
//get conversations by product
export const getConversationByProduct = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { productId } = req.params;

    const conversation = await Conversation.findOne({
      productId,
      buyerId,
    });

   
    if (!conversation) {
      return res.status(200).json({ conversation: null });
    }

    return res.status(200).json({
      message: "Conversation fetched",
      conversation,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error fetching conversation",
      error: error.message,
    });
  }
};

//to get all seller conversations
export const getSellerConversations = async(req, res) =>{
  try {
    const sellerId = req.user._id;

    const { status, search } = req.query;

    let queryObj = {
      sellerId,
      status: { $ne: "completed" } 
    };

    if (status && status !== "all") {
      queryObj.status = status;
    } else {
      queryObj.status = { $ne: "completed" };
    }

    if (search) {
      queryObj.$or = [
        { productName: { $regex: search, $options: "i" } },
        { buyerName: { $regex: search, $options: "i" } }
      ];
    }

    let query = Conversation.find(queryObj)
      .populate("productId", "name images price status")
      .populate("buyerId", "name avatar")
      .sort({ updatedAt: -1 });

    //apply pagination
    const { query: paginatedQuery, page, limit } = paginate(query, req.query);

    const conversations = await paginatedQuery;

    //total count
    const total = await Conversation.countDocuments(queryObj)

    return res.status(200).json({
      message: "Fetched seller conversations successfully",
      data: conversations,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.log(error);
    
    return res.status(500).json({
      message: "Server error whilst fetching conversations"
    })
  }
}

//get info wrt a conversation
export const getConversationInfo = async(req, res) =>{
  try {
    const { conversationId } = req.params;
    const userId =req.user._id

    const conversation = await Conversation.findById(conversationId)
    .populate("buyerId", "avatar name")
    .populate("sellerId", "avatar name")
    .populate("productId", "name price")

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    //  SECURITY CHECK
    if (
      conversation.buyerId._id.toString() !== userId.toString() &&
      conversation.sellerId._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    return res.status(200).json({
      message: "Conversation info achieved",
      conversation
    })
  } catch (error) {
    return res.status(500).json({
      message: "Server error whilst getting conversation info"
    })
  }
}
