import User from "../models/User.js";
import { getIO } from "../config/socket.js";

//Get wishlist
export const getWishlist = async (req, res) => {
  try {
   
    const userId =req.user._id;
    const user = await User.findById(userId).populate("wishlist");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.wishlist.map(product => product._id));
  } catch (error) {
    console.error("GET Wishlist Error:", error); // 👈 important
    res.status(500).json({ message: error.message });
  }
};

// Toggle wishlist item
export const toggleWishlist = async (req, res) => {
  try {
    const userId =req.user._id;
    const { productId } =req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const exists = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (exists) {
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId
      );
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    // Get the updated populated wishlist to filter out invalid products
    const updatedUser = await User.findById(userId).populate("wishlist");

    // Emit socket event to update wishlist count in real-time
    const io = getIO();
    io.to(userId.toString()).emit("wishlist_updated", { 
      wishlist: updatedUser.wishlist.map(product => product._id),
      count: updatedUser.wishlist.length 
    });

    res.json({ wishlist: updatedUser.wishlist.map(product => product._id) });

  } catch (error) {
    console.error("TOGGLE Wishlist Error:", error); // 👈 important
    res.status(500).json({ message: error.message });
  }
};
