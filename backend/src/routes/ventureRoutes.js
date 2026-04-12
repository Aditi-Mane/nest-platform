// routes/ventureRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getVentures, getMyVentures, getVentureById, createVenture, updateVenture, deleteVenture,
  inviteTeamMember, confirmTeamInvite, removeTeamMember,
  addMilestone, updateMilestone, deleteMilestone,
  postUpdate, addComment,
  toggleLike, toggleFollow, toggleEndorse,
  getMessages, sendMessage,
} from "../controllers/ventureController.js";
import {
  applyToVenture, getApplications, respondToApplication, withdrawApplication,
} from "../controllers/applicationController.js";
import { cache, invalidateCache } from "../middleware/cacheMiddleware.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// HELPERS
// Centralised invalidation patterns so mutations stay DRY
// ─────────────────────────────────────────────────────────────

// Call after any mutation that changes a specific venture's data
const invalidateVenture = (ventureId) =>
  invalidateCache(
    "cache:global:/api/ventures*",       // public venture list
    `cache:global:/api/ventures/${ventureId}*` // specific venture detail
    // Note: "my ventures" are user-scoped so they expire naturally via short TTL
    // If you need instant consistency there too, add: `cache:user:*:/api/ventures/my*`
  );

// ─────────────────────────────────────────────────────────────
// VENTURES — CRUD
// ─────────────────────────────────────────────────────────────

// ✅ Cache public venture discovery feed for 3 minutes
// This is likely a heavy aggregation with filters/sorts — safe to cache globally
router.get("/", cache(180), getVentures);

// ✅ Cache current user's own ventures for 2 minutes
// Short TTL so new creates/updates surface quickly without manual invalidation
router.get("/my", protect, cache(120, { userSpecific: true }), getMyVentures);

// ✅ Cache individual venture page for 5 minutes
// Includes team, milestones, updates — expensive to build, slow to change
router.get("/:id", cache(300), getVentureById);

//  No cache — write; invalidate list + user's "my ventures" (via TTL expiry)
router.post(
  "/",
  protect,
  async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate the public list so the new venture shows up immediately
        await invalidateCache("cache:global:/api/ventures*");
      }
      return originalJson(data);
    };
    next();
  },
  createVenture
);

//  No cache — invalidate venture detail + list on any field update
router.patch(
  "/:id",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await invalidateVenture(id);
      }
      return originalJson(data);
    };
    next();
  },
  updateVenture
);

//  No cache — invalidate everything related to this venture on delete
router.delete(
  "/:id",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await invalidateVenture(id);
      }
      return originalJson(data);
    };
    next();
  },
  deleteVenture
);

// ─────────────────────────────────────────────────────────────
// TEAM MANAGEMENT
// All writes — team composition is shown inside venture detail,
// so always invalidate the cached venture page
// ─────────────────────────────────────────────────────────────

//  No cache — invite changes venture's team array
router.post(
  "/:id/team",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) await invalidateVenture(id);
      return originalJson(data);
    };
    next();
  },
  inviteTeamMember
);

//  No cache — accepting an invite updates team status (pending → confirmed)
// This is also semi-real-time: the invited member needs to act on a live invite
router.patch(
  "/:id/team/confirm",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) await invalidateVenture(id);
      return originalJson(data);
    };
    next();
  },
  confirmTeamInvite
);

//  No cache — removal changes team composition
router.delete(
  "/:id/team/:userId",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) await invalidateVenture(id);
      return originalJson(data);
    };
    next();
  },
  removeTeamMember
);

// ─────────────────────────────────────────────────────────────
// MILESTONES
// Shown inside venture detail page — always invalidate on change
// ─────────────────────────────────────────────────────────────

// No cache — new milestone updates venture detail
router.post(
  "/:id/milestones",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) await invalidateVenture(id);
      return originalJson(data);
    };
    next();
  },
  addMilestone
);

// No cache — milestone edit updates venture detail
router.patch(
  "/:id/milestones/:milestoneId",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) await invalidateVenture(id);
      return originalJson(data);
    };
    next();
  },
  updateMilestone
);

//  No cache — milestone removal updates venture detail
router.delete(
  "/:id/milestones/:milestoneId",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) await invalidateVenture(id);
      return originalJson(data);
    };
    next();
  },
  deleteMilestone
);

// ─────────────────────────────────────────────────────────────
// UPDATES & COMMENTS
// New content appears inside venture detail — invalidate on post
// ─────────────────────────────────────────────────────────────

// No cache — new update should appear immediately on venture page
router.post(
  "/:id/updates",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) await invalidateVenture(id);
      return originalJson(data);
    };
    next();
  },
  postUpdate
);

//  No cache — comments appear inside venture detail, invalidate immediately
router.post(
  "/:id/comments",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) await invalidateVenture(id);
      return originalJson(data);
    };
    next();
  },
  addComment
);

// ─────────────────────────────────────────────────────────────
// ENGAGEMENT — Like / Follow / Endorse
// These are toggles that update counters on the venture.
// Invalidate the venture detail so counts are fresh on next load.
// ─────────────────────────────────────────────────────────────

// No cache — like count shown on venture card/detail; must be accurate
router.post(
  "/:id/like",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) await invalidateVenture(id);
      return originalJson(data);
    };
    next();
  },
  toggleLike
);

//  No cache — follow count shown on venture; invalidate
router.post(
  "/:id/follow",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) await invalidateVenture(id);
      return originalJson(data);
    };
    next();
  },
  toggleFollow
);

//  No cache — endorsement shown on venture profile; invalidate
router.post(
  "/:id/endorse",
  protect,
  async (req, res, next) => {
    const { id } = req.params;
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) await invalidateVenture(id);
      return originalJson(data);
    };
    next();
  },
  toggleEndorse
);

// ─────────────────────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────────────────────

// No cache — new application must be visible to venture owner instantly
router.post("/:id/apply", protect, applyToVenture);

// No CACHE — venture owner reviews live applications
// Must show real-time status: pending / accepted / rejected / withdrawn
router.get("/:id/applications", protect, getApplications);

// No cache — accept/reject changes application status in real-time
// Applicant is waiting for a response; staleness is unacceptable
router.patch("/:id/applications/:appId", protect, respondToApplication);

// No cache — withdrawal must reflect immediately
router.patch("/:id/applications/:appId/withdraw", protect, withdrawApplication);

// ─────────────────────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────────────────────

// NO CACHE — venture team chat must be real-time
// Showing a stale message list in a collaboration tool is a UX bug
router.get("/:ventureId/messages", protect, getMessages);

// No cache — sending a message is a write; must appear instantly for recipients
router.post("/:ventureId/messages", protect, sendMessage);

export default router;