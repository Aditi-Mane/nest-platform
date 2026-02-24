import User from "../models/User.js";

export const setUserRole = async (req, res) => {
  try {
    const { selectedRole } = req.body;

    //auth safety
    if(!req.user) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    //validate role
    const allowedRoles = ["buyer", "seller"];
    if(!allowedRoles.includes(selectedRole)) {
      return res.status(400).json({
        message: "Invalid role selected"
      });
    }

    const user = await User.findById(req.user._id);

    if(!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    //add role to availableRoles if not already present
    if(!user.availableRoles.includes(selectedRole)) {
      user.availableRoles.push(selectedRole);
    }

    //set active role
    user.activeRole = selectedRole;

    await user.save();

    return res.status(200).json({
      message: "User role has been set",
      activeRole: user.activeRole,
      sellerStatus: user.sellerStatus
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};

//to get currently logged in user info securely
export const getCurrentUser = async (req, res) =>{
  try {
    if(!req.user){
      return res.status(401).json({
        message: "User unauthorized"
      })
    }

    const user = await User.findById(req.user._id).select("verificationStatus activeRole sellerStatus availableRoles email name");
    if(!user){
      return res.status(404).json({
        message: "User not found"
      })
    }
    res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    })
  }
} 

// @desc   Get logged in user profile
// @route  GET /api/users/me
// @access Private
export const getMe = async (req, res) => {
  try {
    // req.user is already attached by protect middleware
    const user = await User.findById(req.user._id)
      .select("-password -verificationOtp -resetOtp");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json(user);

  } catch (error) {
    console.log("Get Profile Error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};
