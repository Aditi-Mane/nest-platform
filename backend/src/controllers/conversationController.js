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
