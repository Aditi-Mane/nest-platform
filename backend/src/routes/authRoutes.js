import express from "express"
import multer from "multer";
import { changeEmailBeforeVerification, createNewPass, forgotPassword, login, resendEmailOTP, signup, verifyAccount, verifyEmailOTP, verifyOTP } from "../controllers/authController.js";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router(); //mini route handler created
const handleVerifyAccountUpload = (req, res, next) => {
  upload.single("idCard")(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "ID card image must be 5MB or smaller",
      });
    }

    return res.status(400).json({
      message: err.message || "Invalid ID card upload",
    });
  });
};

router.post("/signup", signup);
router.post("/verify-account", protect, handleVerifyAccountUpload, verifyAccount);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/verify-email-otp", verifyEmailOTP);
router.post("/resend-email-otp", resendEmailOTP);
router.post("/change-email-before-verification", changeEmailBeforeVerification);
router.post("/create-new-pass", createNewPass);

export default router;
