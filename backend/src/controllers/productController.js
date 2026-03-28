import Product from '../models/Product.js';

//Get /products?page=1&limit=9&search=&category=&sort=
export const getAllProducts=async(req,res)=>{
  try{
    const { page=1, limit= 9, search= "", category= "all", sort= "recent"} =req.query;

    const query= {
       status: "available", //hide sold or reserved items
    };

    if(category !== "all"){
      query.category =category;
    }

    if(search){
      query.$text = { $search: search };
    }
    let sortOption = {};

      switch (sort) {
        case "price-low":
          sortOption = { price: 1 };
          break;
        case "price-high":
          sortOption = { price: -1 };
          break;
        case "popular":
          sortOption = { averageRating: -1 , reviewCount: -1}; 
          break;
        case "recent":
        default:
          sortOption = { createdAt: -1 };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Number(limit);

    const total= await Product.countDocuments(query);
    const products=await Product.find(query)
    .sort( sortOption )
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate("createdBy", 
      "name avatar collegeName averageRating reviewCount itemsSold responseTime createdAt");

    res.status(200).json({
      success:true,
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
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
      "name avatar collegeName averageRating reviewCount itemsSold responseTime createdAt");
      

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