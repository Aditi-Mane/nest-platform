import express from "express"
import { cancelDeal, confirmDeal, createProduct, deleteProduct, editProduct, getMyProducts, setupSeller } from "../controllers/sellerController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { checkSeller } from "../middleware/sellerMiddleware.js";

const router = express.Router();

router.post("/setup", protect, upload.single("logo"), setupSeller);
router.post("/create", protect, checkSeller, upload.array("images", 5), createProduct);
router.put("/edit/:id", protect, checkSeller, upload.array("images", 5), editProduct);
router.delete("/delete/:id", protect, checkSeller, deleteProduct)
router.get("/my-products", protect, checkSeller, getMyProducts);
router.post("/confirm", protect, checkSeller, confirmDeal);
router.post("/cancel", protect, checkSeller, cancelDeal);

export default router;