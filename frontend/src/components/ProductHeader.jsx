import React from "react";

const ProductsHeader = ({ totalProducts, revenue, lowStock }) => {
  return (
    <div className="products-header">
      <div>
        <h1>Products</h1>
        <p>Manage your product inventory and performance</p>
        <span>{totalProducts} products • {lowStock} low stock alerts</span>
      </div>

      <button className="add-btn">+ Add Product</button>
    </div>
  );
};

export default ProductsHeader;
