import express from "express";
import {
  fileComplaint,
  
} from "../controllers/complaintController.js";

import { protect } from "../middleware/authMiddleware.js"
import uploadEvidence   from "../middleware/uploadEvidenceMiddleware.js";

 
const router = express.Router();
 
/* ── Buyer ── */
router.post("/", protect, uploadEvidence.array("evidence", 3), fileComplaint);

export default router;
 