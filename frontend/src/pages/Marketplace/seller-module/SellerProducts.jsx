
import React, { useState, useRef, useEffect } from "react";
import productsData from "../../../../../backend/src/models/sellerProducts";

const SellerProducts = () => {
  // ORIGINAL LOGIC
  const [products, setProducts] = useState(productsData);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    images: [],
  });

  const fileInputRef = useRef(null);

  const lowStock = products.filter((p) => p.stock <= 5).length;
  const revenue = products.reduce((a, b) => a + b.revenue, 0);
  const avgRating =
    products.length > 0
      ? products.reduce((a, b) => a + b.rating, 0) / products.length
      : 0;

  // DELETE PRODUCT (unchanged)
  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  // FORM CHANGE
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // IMAGE UPLOAD (fixed properly)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const previewImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...previewImages],
    }));

    e.target.value = "";
  };

  // REMOVE IMAGE
  const handleRemoveImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updated });
  };

  // CLEAN MEMORY
  useEffect(() => {
    return () => {
      formData.images.forEach((img) =>
        URL.revokeObjectURL(img.preview)
      );
    };
  }, [formData.images]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.category ||
      !formData.price ||
      !formData.description ||
      formData.images.length === 0
    ) {
      alert("All fields are required!");
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: parseFloat(formData.price),
      stock: 10,
      rating: 0,
      reviews: 0,
      sales: 0,
      revenue: 0,
      views: 0,
      conversion: 0,
      status: "Active",

      // ✅ USE UPLOADED IMAGE
      // image: formData.images[0].preview,
      image: formData.images[0].preview.toString()
    };

    setProducts([...products, newProduct]);
    setShowModal(false);

    setFormData({
      name: "",
      category: "",
      price: "",
      description: "",
      images: [],
    });
  };

  return (
    <div className="p-6 text-[var(--color-text)]">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-[var(--color-muted)]">
              Manage your product inventory and performance
            </p>
            <p className="mt-2 text-sm flex items-center gap-3 text-[var(--color-muted)]">
            <span>{products.length} products</span>

            <span className="text-gray-400">•</span>

            <span>{lowStock} low stock alerts</span>

            <span className="text-gray-400">•</span>

            <span>
              Avg rating:{" "}
              <span className="font-medium text-[var(--color-text)]">
                {avgRating.toFixed(1)}
              </span>{" "}
              <span className="text-yellow-500">⭐</span>
            </span>
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg shadow"
        >
          + Add Product
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
          <p className="text-sm text-[var(--color-muted)]">Total Products</p>
          <h2 className="text-2xl font-bold">{products.length}</h2>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
          <p className="text-sm text-[var(--color-muted)]">Total Revenue</p>
          <h2 className="text-2xl font-bold">${revenue}</h2>
        </div>

        {/* <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
          <p className="text-sm text-[var(--color-muted)]">Low Stock</p>
          <h2 className="text-2xl font-bold text-red-500">{lowStock}</h2>
        </div> */}

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
          <p className="text-sm text-[var(--color-muted)]">Avg Rating</p>
          <h2 className="text-2xl font-bold">⭐ {avgRating.toFixed(1)}</h2>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => {
          const low = p.stock <= 5;

          return (
            <div
              key={p.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:shadow-md transition"
            >
              {/* IMAGE */}
              <div className="h-44 bg-[#efe6d6] flex items-center justify-center overflow-hidden rounded-t-2xl">
                {p.image && p.image.length > 10 ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">{p.image}</span>
                )}
              </div>

              <div className="p-6">

                {/* TITLE + STATUS */}
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">
                    {p.name}
                  </h3>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      low
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {low ? "Low Stock" : "Active"}
                  </span>
                </div>

                {/* DESCRIPTION */}
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  {p.description}
                </p>

                {/* CATEGORY + RATING */}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs px-3 py-1 rounded-full border border-[var(--color-border)] bg-[#efe6d6]">
                    {p.category}
                  </span>

                  <span className="text-sm text-[var(--color-primary)]">
                    ⭐ {p.rating} ({p.reviews})
                  </span>
                </div>

                {/* STATS BOX */}
                <div className="grid grid-cols-3 gap-4 mt-4 bg-[#efe6d6] border border-[var(--color-border)] rounded-xl p-3 text-sm">

                  <div>
                    <p className="text-[var(--color-muted)]">Sales</p>
                    <p className="font-semibold">{p.sales}</p>
                  </div>

                  <div>
                    <p className="text-[var(--color-muted)]">Revenue</p>
                    <p className="font-semibold text-green-700">
                      ${p.revenue}
                    </p>
                  </div>

                  <div>
                    <p className="text-[var(--color-muted)]">Views</p>
                    <p className="font-semibold">{p.views}</p>
                  </div>

                  {/* <div>
                    <p className="text-[var(--color-muted)]">Conv. Rate</p>
                    <p className="font-semibold">
                      {p.conversion}%
                    </p>
                  </div> */}

                </div>

                {/* PRICE + STOCK */}
                <div className="flex justify-between items-center mt-5">
                  <h2 className="text-2xl font-bold text-[var(--color-primary)]">
                    ${p.price}
                  </h2>

                  <span
                    className={`text-sm ${
                      low ? "text-red-500" : "text-[var(--color-muted)]"
                    }`}
                  >
                    Stock: {p.stock}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-between mt-5">

                  <button className="flex-1 border border-[var(--color-border)] rounded-xl py-2 hover:bg-[#f1e7d5] transition">
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="ml-3 text-red-500 hover:text-red-700"
                  >
                    🗑
                  </button>

                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[var(--color-card)] w-[600px] rounded-2xl p-8 max-h-[90vh] overflow-y-auto">

            <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* IMAGE UPLOAD */}
              <div>
                <label className="block font-medium mb-2">
                  Product Images *
                </label>

                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-[var(--color-primary)] rounded-xl p-6 text-center cursor-pointer hover:bg-[#f5eee3]"
                >
                  Click to upload images
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img.preview}
                          alt="preview"
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                name="name"
                placeholder="Product Name *"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2"
              />

              <div className="flex gap-4">
                <input
                  type="text"
                  name="category"
                  placeholder="Category *"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex-1 border rounded-xl px-4 py-2"
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price *"
                  value={formData.price}
                  onChange={handleChange}
                  className="flex-1 border rounded-xl px-4 py-2"
                />
              </div>

              <textarea
                name="description"
                placeholder="Description *"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full border rounded-xl px-4 py-2"
              />

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl"
                >
                  Add Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SellerProducts;