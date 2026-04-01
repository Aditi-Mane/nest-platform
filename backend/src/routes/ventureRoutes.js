import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getVentures, getMyVentures, getVentureById, createVenture, updateVenture, deleteVenture,
  inviteTeamMember, confirmTeamInvite, removeTeamMember,
  addMilestone, updateMilestone, deleteMilestone,
  postUpdate, addComment,
  toggleLike, toggleFollow, toggleEndorse,
  getMessages,
  sendMessage,
} from "../controllers/ventureController.js";
import {
  applyToVenture, getApplications, respondToApplication, withdrawApplication,
} from "../controllers/applicationController.js";
 
const router = express.Router();
 
// Ventures CRUD
router.get("/",       getVentures);
router.get("/my",     protect, getMyVentures);
router.get("/:id",    getVentureById);
router.post("/",      protect, createVenture);
router.patch("/:id",  protect, updateVenture);
router.delete("/:id", protect, deleteVenture);
 
// Team
router.post("/:id/team",           protect, inviteTeamMember);
router.patch("/:id/team/confirm",  protect, confirmTeamInvite);
router.delete("/:id/team/:userId", protect, removeTeamMember);
 
// Milestones
router.post("/:id/milestones",                protect, addMilestone);
router.patch("/:id/milestones/:milestoneId",  protect, updateMilestone);
router.delete("/:id/milestones/:milestoneId", protect, deleteMilestone);
 
// Updates + Comments
router.post("/:id/updates",  protect, postUpdate);
router.post("/:id/comments", protect, addComment);
 
// Engagement
router.post("/:id/like",    protect, toggleLike);
router.post("/:id/follow",  protect, toggleFollow);
router.post("/:id/endorse", protect, toggleEndorse);
 
// Applications
router.post("/:id/apply",                         protect, applyToVenture);
router.get("/:id/applications",                   protect, getApplications);
router.patch("/:id/applications/:appId",          protect, respondToApplication);
router.patch("/:id/applications/:appId/withdraw", protect, withdrawApplication);

router.get("/:ventureId/messages", protect, getMessages);
router.post("/:ventureId/messages", protect, sendMessage);
 
export default router;