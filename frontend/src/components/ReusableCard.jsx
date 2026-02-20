import React from "react";

const ReusableCard = ({ product }) => {
  const low = product.stock <= 5;

  return (
    <div className="product-card">
      <div className="image">{product.image}</div>

      <div className="content">
        <div className="title-row">
          <h3>{product.name}</h3>
          <span className={`status ${low ? "low" : "active"}`}>
            {low ? "Low Stock" : "Active"}
          </span>
        </div>

        <p className="desc">{product.description}</p>

        <div className="rating">
          ⭐ {product.rating} ({product.reviews})
        </div>

        <div className="stats">
          <div>
            <p>Sales</p>
            <strong>{product.sales}</strong>
          </div>
          <div>
            <p>Revenue</p>
            <strong>${product.revenue}</strong>
          </div>
          <div>
            <p>Views</p>
            <strong>{product.views}</strong>
          </div>
          <div>
            <p>Conv. Rate</p>
            <strong>{product.conversion}%</strong>
          </div>
        </div>

        <div className="bottom">
          <h2>${product.price}</h2>
          <span className={low ? "stock low" : "stock"}>
            Stock: {product.stock}
          </span>
        </div>

        <button className="edit-btn">Edit</button>
      </div>
    </div>
  );
};

export default ReusableCard;
