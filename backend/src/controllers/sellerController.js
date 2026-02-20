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