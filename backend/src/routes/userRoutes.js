import express from "express"
import { getCurrentUser, setUserRole } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch("/choose-role", protect, setUserRole);
router.get("/me", protect ,getCurrentUser)

export default router;