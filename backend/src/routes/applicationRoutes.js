import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMyApplications } from "../controllers/applicationController.js";
 
const router = express.Router();
 
// My submitted applications — standalone, not nested under /ventures/:id
router.get("/mine", protect, getMyApplications);
 
export default router;