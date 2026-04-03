import User from "../models/User.js";
import express from "express"

import { getCurrentUser, setUserRole, updateProfile, updateStore, changePassword, switchRole, deleteAccount, getUserCount, getUserByEmail } from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { checkSeller } from "../middleware/sellerMiddleware.js";

const router = express.Router();

router.patch("/choose-role", protect, setUserRole);

// GET current logged in user
router.get("/me", protect, getCurrentUser);
router.put("/updatePassword", protect, changePassword);
router.put("/switch-role", protect, switchRole);
router.delete("/delete", protect, deleteAccount);
router.get("/count", getUserCount);
router.get("/search", getUserByEmail);

router.put("/updateStore", protect, checkSeller, upload.single("storeLogo"), updateStore);
router.put("/updateProfile", protect, upload.single("avatar"), updateProfile);

router.put("/update-avatar", protect, (req, res) => {
  upload.single("avatar")(req, res, async (err) => {

    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      user.avatar = `/uploads/${req.file.filename}`;
      const updatedUser = await user.save();

      res.status(200).json(updatedUser);

    } catch (error) {
      console.log("Avatar Upload Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
});

export default router;