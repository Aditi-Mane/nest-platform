import Product from '../models/Product.js';

//Get all product
export const getAllProducts=async(req,res)=>{
  try{
    const products=await Product.find()
    .populate("createdBy", 
      "name avatar collegeName rating reviewCount itemsSold responseTime createdAt");

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

//Get product by id
export const getProductById=async(req,res)=>{
    try{
      const product =await Product.findById(req.params.id)
      .populate("createdBy", 
      "name avatar collegeName rating reviewCount itemsSold responseTime createdAt");
      

      if(!product){
        return res.status(404).json({
            message: "Product not found",
        });
      }
      res.json({ product});
    }
    catch (err) {
    res.status(500).json({ message: err.message });
   }
};