import React from "react";

const ProductsFilter = ({ search, setSearch, setCategory, setSort }) => {
  return (
    <div className="filters">
      <input
        placeholder="Search products by name, description, or SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option>Home & Living</option>
        <option>Fashion</option>
        <option>Stationery</option>
      </select>

      <select onChange={(e) => setSort(e.target.value)}>
        <option value="">Sort by</option>
        <option value="sales">Sales</option>
        <option value="price">Price</option>
      </select>
    </div>
  );
};

export default ProductsFilter;
