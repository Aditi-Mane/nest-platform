import express from "express"
import { login, signup, verifyAccount } from "../controllers/authController.js";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router(); //mini route handler created

router.post("/signup", signup);
router.post("/verify-account", protect, upload.single("idCard"), verifyAccount);
router.post("/login", login);

export default router;