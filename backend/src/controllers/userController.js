import User from "../models/User.js";
import bcrypt from "bcrypt";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { deleteFromS3 } from "../utils/deleteFromS3.js";

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

    if (!user.availableRoles.includes("buyer")) {
      user.availableRoles.push("buyer");
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

    const user = await User.findById(req.user._id).select(
      "verificationStatus activeRole sellerStatus availableRoles email name storeName storeDescription storeLocation storeLogo payoutUPI avatar collegeName"
    );
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

export const updateProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if(!user){
      return res.status(404).json({
        message:"User not found"
      });
    }

    const {
      payoutUPI,
      collegeName
    } = req.body;

    if (collegeName !== undefined) {
      user.collegeName = collegeName;
    }

    if (payoutUPI !== undefined) {
      user.payoutUPI = payoutUPI;
    }
    if (req.file) {
      // delete old avatar
      if (user.avatar) {
        await deleteFromS3(user.avatar).catch(() => {});
      }

      // upload new avatar
      const avatarUrl = await uploadToS3(req.file);
      user.avatar = avatarUrl;
    }

     const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

export const updateStore = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if(!user){
      return res.status(404).json({
        message:"User not found"
      });
    }

    const {
      storeName,
      storeDescription,
      storeLocation,
      payoutUPI,
    } = req.body;

    if(storeName) user.storeName = storeName;
    if(storeDescription) user.storeDescription = storeDescription;
    if(storeLocation) user.storeLocation = storeLocation;
    if(payoutUPI) user.payoutUPI = payoutUPI;

    if (req.file) {
      if (user.storeLogo) {
        await deleteFromS3(user.storeLogo).catch(() => {});
      }
      const logoUrl = await uploadToS3(req.file);
      user.storeLogo = logoUrl;
    }

    await user.save();

    res.json({
      message:"Store updated successfully",
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

export const changePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6 || !/\d/.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters and contain a number",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const saltRounds = 10;
    user.password = await bcrypt.hash(password, saltRounds);

    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("Change Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const switchRole = async (req, res) => {
  try {
    const user = req.user;
    const { role } = req.body;

    //validate role
    const allowedRoles = ["buyer", "seller"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    //ensure buyer always exists
    if (!user.availableRoles.includes("buyer")) {
      user.availableRoles.push("buyer");
    }

    //check permission
    if (!user.availableRoles.includes(role)) {
      return res.status(400).json({
        message: "Role not allowed",
      });
    }

    //avoid unnecessary update
    if (user.activeRole === role) {
      return res.status(200).json({
        message: "Already in this role",
        role,
      });
    }

    //switch role
    user.activeRole = role;
    await user.save();

    return res.status(200).json({
      message: "Role switched",
      role,
    });

  } catch (error) {
    console.log("Switch role error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = "Deleted User";
    user.email = `deleted_${user._id}@deleted.com`;
    user.avatar = "";

    user.collegeId = null;
    user.idCardImage = null;
    user.payoutUPI = null;

    user.verificationStatus = "rejected";
    user.storeName = "Deleted Store";
    user.storeDescription = "";
    user.storeLogo = "";
    user.storeLocation = "";

    user.sellerStatus = "none";

    user.activeRole = null;
    user.availableRoles = ["buyer"]; // safe fallback
    user.isDeleted = true;

    await user.save();

    return res.status(200).json({
      message: "Account deleted successfully",
    });

  } catch (error) {
    console.log("Delete account error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc   Update avatar
// @route  PUT /api/users/update-avatar
// @access Private
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
