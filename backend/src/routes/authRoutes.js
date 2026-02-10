import express from "express"
import { createNewPass, forgotPassword, login, signup, verifyAccount, verifyOTP } from "../controllers/authController.js";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router(); //mini route handler created

router.post("/signup", signup);
router.post("/verify-account", protect, upload.single("idCard"), verifyAccount);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/create-new-pass", createNewPass);

export default router;