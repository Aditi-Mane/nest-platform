import User from "../models/User.js";

// GET all user entries
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// APPROVE USER
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.verificationStatus = "approved";
    user.isVerified = true;

    await user.save();

    res.json({ message: "User approved" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// REJECT USER
export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.verificationStatus = "rejected";

    await user.save();

    res.json({ message: "User rejected" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const underReview = async (req, res) =>{
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.verificationStatus = "under_review";

    await user.save();

    res.json({ message: "User under review" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
