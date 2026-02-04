import express from "express"
import { signup } from "../controllers/authController.js";

const router = express.Router(); //mini route handler created

router.post("/signup", signup);

export default router;