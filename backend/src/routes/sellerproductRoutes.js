const router = require("express").Router();
const { addProduct, getProducts } = require("../controllers/productController");

router.post("/", addProduct);
router.get("/", getProducts);

module.exports = router;
