import express from "express"
import { setupSeller } from "../controllers/sellerController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/setup", protect, upload.single("logo"), setupSeller);

export default router;