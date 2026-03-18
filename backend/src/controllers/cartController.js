import Cart from "../models/Cart.js";

export const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        populate: {
          path: "createdBy",
          select: "name avatar collegeName"
        }
      });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cartItems: []
      });
    }

    // remove deleted products
    const cleanedItems = cart.items.filter(item => item.product !== null);

    // optional: permanently remove them from DB
    if (cleanedItems.length !== cart.items.length) {
      cart.items = cleanedItems;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      cartItems: cleanedItems
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

// Remove a single item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.log("Remove From Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update quantity of a specific item
export const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
    });
  } catch (error) {
    console.log("Update Cart Quantity Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.log("Clear Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};