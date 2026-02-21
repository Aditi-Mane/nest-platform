import User from "../models/User.js";

//Get wishlist
export const getWishlist = async (req, res) => {
  try {
    console.log("Fetching wishlist for:", req.params.userId);

    const user = await User.findById(req.params.userId).populate("wishlist");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.wishlist);
  } catch (error) {
    console.error("GET Wishlist Error:", error); // 👈 important
    res.status(500).json({ message: error.message });
  }
};

// Toggle wishlist item
export const toggleWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    console.log("Toggle request:", userId, productId);

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

    res.json({ wishlist: user.wishlist });

  } catch (error) {
    console.error("TOGGLE Wishlist Error:", error); // 👈 important
    res.status(500).json({ message: error.message });
  }
};
