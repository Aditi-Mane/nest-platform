import express from "express"
import { setUserRole } from "../controllers/userController.js";

const router = express.Router();

router.patch("/choose-role", setUserRole);

export default router;