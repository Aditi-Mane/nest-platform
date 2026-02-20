import Cart from "../models/Cart.js";

export const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        populate: {
          path: "createdBy", // seller reference
          select: "name avatar university"
        }
      });

    // If no cart yet
    if (!cart) {
      return res.status(200).json({
        success: true,
        cartItems: []
      });
    }

    res.status(200).json({
      success: true,
      cartItems: cart.items
    });

  } catch (error) {
    console.log("Get Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const addToCart= async(req,res)=>{

    try{
      const userId =req.user._id;
      const { productId } =req.body;

      if(!productId){
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }
      //find users cart
      let cart=await Cart.findOne({ user: userId});

      //if cart doesn't exist -> create one
      if(!cart){
        cart =await Cart.create({
          user: userId,
          items:[ {
            product: productId,
            quantity:1
          }],
      });
    }else{
       //check ifproduct already in cart
       const existingItem=cart.items.find(
        (item)=> item.product.toString()==productId
       );
       
       if(existingItem){
            //Increase quantity
            existingItem.quantity +=1;
       }else{
          cart.items.push({
                product: productId,
                quantity: 1,
          });
       }
       await cart.save();
    }
    res.status(200).json({
      success: true,
      message: "Product added to cart"
    });

    }
    catch(error){
    console.log("Add to Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};