import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAcceptedApplications, getApplicationStatus, getMyApplications } from "../controllers/applicationController.js";
 
const router = express.Router();
 
// My submitted applications — standalone, not nested under /ventures/:id
router.get("/mine", protect, getMyApplications);
router.get("/:ventureId/status", protect, getApplicationStatus);
router.get("/accepted", protect, getAcceptedApplications);
 
export default router;