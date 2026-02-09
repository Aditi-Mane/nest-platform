import express from "express"
import { signup, verifyAccount } from "../controllers/authController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router(); //mini route handler created

router.post("/signup", signup);
router.post("/verify-account",upload.single("idCard"), verifyAccount);

export default router;