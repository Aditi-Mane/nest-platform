import express from "express"
import { changeEmailBeforeVerification, createNewPass, forgotPassword, login, resendEmailOTP, signup, verifyAccount, verifyEmailOTP, verifyOTP } from "../controllers/authController.js";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router(); //mini route handler created

router.post("/signup", signup);
router.post("/verify-account", protect, upload.single("idCard"), verifyAccount);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/verify-email-otp", verifyEmailOTP);
router.post("/resend-email-otp", resendEmailOTP);
router.post("/change-email-before-verification", changeEmailBeforeVerification);
router.post("/create-new-pass", createNewPass);

export default router;