import Product from '../models/Product.js';

//Get all product
export const getAllProducts=async(req,res)=>{
  try{
    const products=await Product.find()
    .populate("createdBy", "name avatar");

    res.status(200).json({
      success:true,
      products,
    });
  }catch(error){
      console.error("Error fetching products", error);

      res.status(500).json({
        success: false,
        message: "Server error while fetching products",
      });
  }
};