import express from "express";
import {
  approveUser,
  rejectUser,
  underReview,
  getAllUsers
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.patch("/users/:id/approve", approveUser);
router.patch("/users/:id/reject", rejectUser);
router.patch("/users/:id/under-review", underReview);

export default router;
