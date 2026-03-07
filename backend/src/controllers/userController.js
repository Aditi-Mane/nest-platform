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
      .select("-password -verificationOtp -verificationOtpExpiry");

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

export const updateSellerSettings = async (req, res) => {
  try {

    console.log("Incoming Settings:", req.body);  // 👈 ADD THIS

    const user = await User.findById(req.user._id);

    if(!user){
      return res.status(404).json({
        message:"User not found"
      });
    }

    const {
      avatar,
      storeName,
      storeDescription,
      storeLocation,
      payoutUPI,
      notifications
    } = req.body;

    if(avatar) user.avatar = avatar;
    if(storeName) user.storeName = storeName;
    if(storeDescription) user.storeDescription = storeDescription;
    if(storeLocation) user.storeLocation = storeLocation;
    if(payoutUPI) user.payoutUPI = payoutUPI;
    if(notifications) user.notifications = notifications;

    await user.save();

    res.json({
      message:"Settings updated successfully",
      user
    });

  } catch(error){
    console.log(error);
    res.status(500).json({message:"Server error"});
  }
};

export const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // update allowed fields only
    user.university = req.body.university || user.university;
    user.major = req.body.major || user.major;
    user.year = req.body.year || user.year;
    user.bio = req.body.bio || user.bio;

    const updatedUser = await user.save();

    res.status(200).json(updatedUser);

  } catch (error) {
    console.log("Update Profile Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    user.avatar = `/uploads/${req.file.filename}`;

    const updatedUser = await user.save();

    res.status(200).json(updatedUser);

  } catch (error) {
    console.log("Avatar Upload Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
