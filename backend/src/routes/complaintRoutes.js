import express from "express";
import {
  banSellerFromComplaint,
  dismissComplaint,
  fileComplaint,
  getReportedSellers,
  resolveComplaint,
  unbanSeller,
} from "../controllers/complaintController.js";

import { protect } from "../middleware/authMiddleware.js"
import uploadEvidence   from "../middleware/uploadEvidenceMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

 
const router = express.Router();
 
/* ── Buyer ── */
router.post("/", protect, uploadEvidence.array("evidence", 3), fileComplaint);
router.get("/reported-sellers", protect, requireAdmin, getReportedSellers);
router.patch("/:id/resolve", protect, requireAdmin, resolveComplaint);
router.patch("/:id/dismiss", protect, requireAdmin, dismissComplaint);
router.patch("/:id/ban", protect, requireAdmin, banSellerFromComplaint);
router.patch("/sellers/:sellerId/unban", protect, requireAdmin, unbanSeller);

export default router;
 
