import express from "express"
import { signup, verifyAccount } from "../controllers/authController.js";

const router = express.Router(); //mini route handler created

router.post("/signup", signup);
router.post("/verify-account", verifyAccount);

export default router;