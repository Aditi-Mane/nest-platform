import Conversation from "../models/Conversation.js";
import Product from "../models/Product.js";

export const createConversation =async (req,res)=>{
  try{
    const buyerId=req.user._id;
    const {productId} =req.body;

    //1. Check product exists
    const product = await Product.findById(productId);

    if(!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //2. Check product available
    if(product.status !== "available"){
      return res.status(400).json({ message: "Product not available" });
    }

    //3. Check existing conversation
    let conversation =await Conversation.findOne({
      productId,
      buyerId,
      status :{ $in : ["initiated", "negotiating"]},
    });

    //4.Create if not exists
    if(!conversation){
      conversation =await Conversation.create({
        productId,
        buyerId,
        sellerId: product.createdBy,
        status: "initiated",

      });

    }
  res.status(200).json({
      message: "Conversation ready",
      conversation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

//to get all seller conversations
export const getSellerConversations = async(req, res) =>{
  try {
    const sellerId = req.user._id;

    const conversations = await Conversation.find({sellerId})
    .populate("productId", "name images price status")
    .populate("buyerId", "name avatar")
    .sort({updatedAt: -1})

    return res.status(200).json({
      message: "Fetched seller conversations successfully",
      conversations
    })
  } catch (error) {
    return res.status(500).json({
      message: "Server error whilst fetching conversations"
    })
  }
}
