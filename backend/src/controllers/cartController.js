import Cart from "../models/Cart.js";

export const getUserCart= async (req, res)=>{
  try{
    const cart= await Cart.findOne({user: req.user._id}).populate(
      "items.product",
      "name price images category createdBy"
    );

    if(!cart) {
      return res.json({ success: true, cart: {items: []}});
    }
    res.json({
      success: true,
      cart,
    });
  } catch(error){
      console.log("Cart Fetch Error", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching cart",
      })
  }
};