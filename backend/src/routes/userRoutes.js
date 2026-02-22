import express from "express"
import { getCurrentUser, setUserRole } from "../controllers/userController.js";
import { getMe } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch("/choose-role", protect, setUserRole);
router.get("/me", protect ,getCurrentUser)

// GET current logged in user
router.get("/me", protect, getMe);

export default router;