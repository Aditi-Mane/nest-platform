import Product from "../models/Product.js";
import User from "../models/User.js";

export const setupSeller = async (req, res) => {
  try {
    const userId = req.user._id;

    const { storeName, storeDescription, storeLocation, payoutUPI } = req.body;

    if (!storeName || !storeDescription || !storeLocation) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.role = "seller";
    user.sellerStatus = "active";

    user.storeName = storeName;
    user.storeDescription = storeDescription;
    user.storeLocation = storeLocation;
    user.payoutUPI = payoutUPI;

    if (req.file) {
      user.storeLogo = `/uploads/${req.file.filename}`;
    }

    await user.save();

    return res.status(200).json({
      message: "Seller Setup successful"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

//create product
export const createProduct = async (req, res) => {
  try {
    const user = req.user;

    const {
      name,
      description,
      category,
      price,
      stock,
      condition,
    } = req.body;

    //basic validation
    if(!name || !description || !category || !price) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    if(Number(price) <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    if(stock && Number(stock) < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative",
      });
    }

    //handle uploaded images
    const imageUrls = req.files?.map((file) => ({
      url: `${req.protocol}://${req.get("host")}/${file.path}`,
    })) || [];

    if (imageUrls.length === 0) {
      return res.status(400).json({
        message: "At least one image is required",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price: Number(price),
      images: imageUrls,
      condition: condition,
      stock: stock ? Number(stock) : 1,
      location: user.storeLocation || "",
      createdBy: user._id,
      status: stock === 0 ? "sold" : "available",
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({
      message: "Server error while creating product",
    });
  }
};

//get all seller products
export const getMyProducts = async (req, res) =>{
  try {
    const sellerId = req.user._id;

    const { page = 1, limit = 6 } = req.query;

    const products = await Product.find({ createdBy: sellerId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments({
      createdBy: sellerId,
    });

    return res.status(200).json({
      products,
      total,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching seller products",
    });
  }
}

//edit product info
export const editProductInfo = async (req, res) =>{
  try {
    
    return res.status(200).json({
      message: "Product has been edited successfully"
    })
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching seller products",
    });
  }
}