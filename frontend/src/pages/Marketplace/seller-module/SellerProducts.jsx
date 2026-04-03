
import { useState, useRef, useEffect } from "react";
import api from "../../../api/axios.js";
import { TfiPencilAlt } from "react-icons/tfi";
import { RiDeleteBin6Line } from "react-icons/ri";
import toast from "react-hot-toast";
import { ChevronDown } from "lucide-react";
import Pagination from "../../../components/Pagination.jsx";

const SellerProducts = () => {
  // ORIGINAL LOGIC
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [expandedCards, setExpandedCards] = useState({});
  const [includedInput, setIncludedInput] = useState("");

  const [analytics, setAnalytics] = useState(null);

  const [ratings, setRatings] = useState([]);
  const [overallRating, setOverallRating] = useState(0);

  useEffect(() => {

    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/seller/analytics");
        setAnalytics(res.data);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

  }, []);

  const getProductAnalytics = (productId) => {
    return analytics?.products.find(
      item => item.productId === productId
    );
  };

  useEffect(() => {

    const fetchRatings = async () => {
      try {
        const res = await api.get("/seller/productRatings");

        setRatings(res.data.products);
        setOverallRating(res.data.overallRating);

      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    fetchRatings();

  }, []);

  const getProductRating = (productId) => {
    return ratings.find(r => r.productId === productId);
  };

  const addIncludedItem = () => {
    const item = includedInput.trim();
    if (!item) return;

    if (formData.whatsIncluded.length >= limit) {
      toast.error(`You can only add up to ${limit} items`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      whatsIncluded: [...prev.whatsIncluded, item]
    }));

    setIncludedInput("");
  };

  const removeIncludedItem = (index) => {
    setFormData(prev => ({
      ...prev,
      whatsIncluded: prev.whatsIncluded.filter((_, i) => i !== index)
    }));
  };

  const toggleIncluded = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const limit = 6;

  const [imageIndexes, setImageIndexes] = useState({});

  const categories = [
    "Study Material",
    "Electronics",
    "Fashion",
    "Hostel Essentials",
    "Handmade",
    "Sports",
    "Services",
    "Other"
  ];

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    images: [],
    whatsIncluded: [] 
  });

  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState("latest");
  const [productCategory, setProductCategory] = useState("all");

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setFetchLoading(true);

        const { data } = await api.get("/seller/my-products", {
          params: {
            page,
            limit: 6,
            category: productCategory,
            sort: productSort,
            search: productSearch
          }
        });

        setProducts(data.data); 
        setTotalPages(data.totalPages);

      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProducts();
  }, [page, productCategory, productSort, productSearch]);

  useEffect(() => {
    setPage(1);
  }, [productCategory, productSort, productSearch]);
  
  // FORM CHANGE
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/seller/delete/${id}`);

      //remove from UI instantly
      setProducts((prev) => prev.filter((p) => p._id !== id));

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to delete product"
      );
    }
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

  const handleRemoveExistingImage = (index) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
  };

  const handleEdit = (product) => {
    setError("");
    setEditingProduct(product);
    setExistingImages(product.images || []);
    setIncludedInput("");
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      condition: product.condition || "",
      stock: product.stock || "",
      images: [],
      whatsIncluded: product.whatsIncluded || []
    });
    setShowEditModal(true);
  };

  // CLEAN MEMORY
  useEffect(() => {
    return () => {
      formData.images.forEach((img) =>
        URL.revokeObjectURL(img.preview)
      );
    };
  }, [formData.images]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.description || !formData.category || !formData.price) {
      setError("Please fill all required fields.");
      return;
    }

    if (Number(formData.price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    if (!editingProduct && formData.images.length === 0) {
      setError("At least one product image is required.");
      return;
    }

    if (
      editingProduct &&
      existingImages.length === 0 &&
      formData.images.length === 0
    ) {
      setError("At least one product image is required.");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();

      form.append("name", formData.name.trim());
      form.append("description", formData.description.trim());
      form.append("category", formData.category);
      form.append("price", Number(formData.price));
      form.append("stock", formData.stock ? Number(formData.stock) : 1);

      if (formData.condition) {
        form.append("condition", formData.condition);
      }

      form.append(
        "whatsIncluded",
        JSON.stringify(formData.whatsIncluded || [])
      );

      if (editingProduct) {
        existingImages.forEach((img) => {
          form.append("existingImages", img.url);
        });
      }

      formData.images.forEach((img) => {
        form.append("images", img.file);
      });

      let response;

      if (editingProduct) {
        response = await api.put(
          `/seller/edit/${editingProduct._id}`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        response = await api.post(
          "/seller/create",
          form,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      const updatedProduct = response.data.product;

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === updatedProduct._id ? updatedProduct : p
          )
        );

        toast.success("Product edited successfully");
      } else {
        setProducts((prev) => [updatedProduct, ...prev]);

        toast.success("Product added successfully");
      }

      setEditingProduct(null);
      setExistingImages([]);
      setShowModal(false);
      setShowEditModal(false);
      setIncludedInput("");

      setFormData({
        name: "",
        category: "",
        price: "",
        description: "",
        images: [],
        condition: "",
        stock: "",
        whatsIncluded: []
      });

    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Something went wrong while saving product.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6 text-text">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted mt-1">
              Manage your product inventory and performance
            </p>
            <p className="mt-2 text-sm flex items-center gap-3 text-muted">
            <span>{products.length} products</span>
            <span className="text-gray-400">•</span>

            <span>
              Avg rating:{" "}
              <span className="font-medium text-text">
                {overallRating.toFixed(1)}
              </span>{" "}
              <span className="text-yellow-500">⭐</span>
            </span>
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setExistingImages([]);
            setFormData({
              name: "",
              category: "",
              price: "",
              description: "",
              images: [],
              condition: "",
              stock: "",
              whatsIncluded: []
            });
            setError("");
            setShowModal(true);
          }}
          className="bg-primary text-white px-5 py-2 rounded-lg shadow"
        >
          + Add Product
        </button>
      </div>

      {/* SEARCH + SORT + CATEGORY */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <input
          type="text"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder="Search products by name or description..."
          className="w-full lg:w-5/5 bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary transition"
        />

        <select
          value={productCategory}
          onChange={(e) => setProductCategory(e.target.value)}
          className="w-full lg:w-1/5 md:w-1/5 bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary transition appearance-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg fill='%23666' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            paddingRight: "36px",
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={productSort}
          onChange={(e) => setProductSort(e.target.value)}
          className="w-full lg:w-1/5 bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary transition appearance-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg fill='%23666' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            paddingRight: "36px",
          }}
        >
          <option value="latest">Latest</option>
          <option value="rating">Highest Rating</option>
          <option value="views">Most Viewed</option>
          {/* <option value="sales">Best Selling</option> */}
        </select>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border p-4 rounded-xl">
          <p className="text-sm text-muted mb-2">Total Products</p>
          <h2 className="text-2xl font-bold">{products.length}</h2>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl">
          <p className="text-sm text-muted mb-2">Total Revenue</p>
          <h2 className="text-2xl font-bold">₹ {analytics?.totalRevenue || 0}</h2>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl">
          <p className="text-sm text-muted mb-2">Average Rating</p>
          <h2 className="text-2xl font-bold">⭐ {overallRating.toFixed(1)}</h2>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {fetchLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))
        ) : products.length === 0 ? (
          <p className="text-muted mb-4">No matching products found</p>
        ) : (
          products.map((p) => {
            return (
              <div
                key={p._id}
                className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition"
              >
              <div className="relative h-44 bg-[#efe6d6] flex items-center justify-center overflow-hidden rounded-t-2xl">

                {/* STATUS BADGE */}
                <span
                  className={`absolute top-2 right-2 text-xs px-3 py-1 rounded-full font-medium shadow-sm
                    ${
                      p.status === "sold"
                        ? "bg-red-100 text-red-700"
                        : p.status === "available"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>

                {p.images && p.images.length > 0 ? (
                <>
                  <img
                    src={p.images[imageIndexes[p._id] || 0].url}
                    alt={p.name}
                    className="w-full h-full object-contain"
                  />

                  {/* DOT INDICATOR */}
                  {p.images.length > 1 && (
                    <div className="absolute bottom-2 flex gap-1">
                      {p.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            setImageIndexes((prev) => ({
                              ...prev,
                              [p._id]: index
                            }))
                          }
                          className={`w-2 h-2 rounded-full ${
                            (imageIndexes[p._id] || 0) === index
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-muted">No Image</span>
              )}
              </div>

              <div className="p-6">

                {/* TITLE + STATUS */}
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">
                    {p.name}
                  </h3>
                </div>

                {/* DESCRIPTION */}
                {/* DESCRIPTION + ARROW */}
                <div className="mt-2">
                  
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-muted flex-1">
                      {p.description}
                    </p>

                    {p.whatsIncluded?.length > 0 && (
                      <button
                        onClick={() => toggleIncluded(p._id)}
                        className="text-muted hover:text-primary transition"
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${
                            expandedCards[p._id] ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* COLLAPSIBLE LIST */}
                  {expandedCards[p._id] && (
                    <ul className="mt-2 text-sm text-muted space-y-1">
                      <h2 className="text-text">What's included: </h2>
                      {p.whatsIncluded.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          ✓ {item}
                        </li>
                      ))}
                    </ul>
                  )}

                </div>

                {/* CATEGORY + RATING */}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs px-3 py-1 rounded-full border border-border bg-[#efe6d6]">
                    {p.category}
                  </span>

                  <span className="text-sm text-primary">
                    ⭐ {getProductRating(p._id)?.avgRating || 0} ({getProductRating(p._id)?.totalReviews || 0})
                  </span>
                </div>

                {/* STATS BOX */}
                <div className="grid grid-cols-3 gap-4 mt-4 bg-[#efe6d6] border border-border rounded-xl p-3 text-sm">

                  <div>
                    <p className="text-muted">Sales</p>
                    <p className="font-semibold">{getProductAnalytics(p._id)?.sales || 0}</p>
                  </div>

                  <div>
                    <p className="text-muted">Revenue</p>
                    <p className="font-semibold text-green-700">
                      ₹ {getProductAnalytics(p._id)?.revenue || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted">Views</p>
                    <p className="font-semibold">{p.views}</p>
                  </div>

                </div>

                {/* PRICE + STOCK */}
                <div className="flex justify-between items-center mt-5">
                  <h2 className="text-2xl font-bold text-primary">
                    ₹{p.price}
                  </h2>

                  <span
                    className="text-sm text-muted"
                  >
                    Stock: {p.stock}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-between mt-5">

                  <button onClick={() => handleEdit(p)} className="flex-1 border border-border rounded-xl py-2 hover:bg-[#f1e7d5] transition">
                    <span className="flex gap-2 justify-center items-center text-muted"><TfiPencilAlt size={20}/>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(p._id)}
                    className="ml-3 flex items-center justify-center 
                      w-10 h-10 rounded-xl
                      border border-border
                    
                      text-muted
                      hover:text-red-700
                      transition duration-200"
                  ><RiDeleteBin6Line size={20}/></button>

                </div>

              </div>
            </div>
          );
        }))}
      </div>

      {/* PAGINATION */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-card w-162.5 rounded-2xl p-8 max-h-[90vh] overflow-y-auto shadow-xl">

            <h2 className="text-2xl font-bold text-text">
              Add New Product
            </h2>

            <p className="text-sm text-muted mt-2 mb-4">
              Fill in the details below to add a new product to your store.
              All fields marked with <span className="text-primary">*</span> are required.
            </p>

            {error && (
              <div className="bg-red-100 text-red-700 border border-red-300 rounded-xl px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* IMAGE UPLOAD */}
              <div>
                <label className="block font-medium text-text mb-2">
                  Product Images <span className="text-primary">*</span>
                </label>

                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:bg-background transition"
                >
                  <p className="text-text font-medium">
                    Click to upload images
                  </p>
                  <p className="text-sm text-muted mt-1">
                    You can select multiple images (PNG, JPG, up to 5MB each)
                  </p>

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
                          className="w-full h-24 object-cover rounded-xl border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PRODUCT NAME */}
              <div>
                <label className="block font-medium text-text mb-2">
                  Product Name <span className="text-primary">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Handmade Ceramic Mug"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={120}
                  className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
                />

                <div className="flex justify-between text-xs mt-2 text-muted">
                  <span>Choose a clear, descriptive name</span>
                  <span>{formData.name.length}/120</span>
                </div>
              </div>

              {/* CATEGORY + PRICE */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block font-medium text-text mb-2">
                    Category <span className="text-primary">*</span>
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
                  >
                    <option value="">Select Category *</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-text mb-2">
                    Price (₹) <span className="text-primary">*</span>
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-3 text-muted">₹</span>
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full border border-border bg-background rounded-xl pl-8 pr-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
                    />
                  </div>
                </div>

              </div>

              {/* CONDITION + STOCK (Optional) */}
              <div className="grid grid-cols-2 gap-4">

                {/* CONDITION */}
                <div>
                  <label className="block font-medium text-text mb-2">
                    Condition
                  </label>

                  <select
                    name="condition"
                    value={formData.condition || ""}
                    onChange={handleChange}
                    className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
                  >
                    <option value="">Select Condition</option>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>

                  <p className="text-xs text-muted mt-2">
                    Choose New/Used condition or leave empty
                  </p>
                </div>

                {/* STOCK */}
                <div>
                  <label className="block font-medium text-text mb-2">
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    name="stock"
                    placeholder="Default: 1"
                    value={formData.stock || ""}
                    onChange={handleChange}
                    min="1"
                    className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
                  />

                  <p className="text-xs text-muted mt-2">
                    Leave empty to set default stock (1)
                  </p>
                </div>

              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block font-medium text-text mb-2">
                  Description <span className="text-primary">*</span>
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe your product in detail. Include materials, dimensions, care instructions, etc."
                  className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text resize-none"
                />
              </div>

              {/* WHAT'S INCLUDED */}
              <div className="mt-0.5">

                <label className="block text-sm font-medium mb-2">
                  What's Included
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={includedInput}
                    onChange={(e) => setIncludedInput(e.target.value)}
                    disabled={formData.whatsIncluded.length >= limit}
                    placeholder="Example: Source files"
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm"
                  />

                  <button
                    type="button"
                    onClick={addIncludedItem}
                    disabled={formData.whatsIncluded.length >= limit}
                    className="px-3 py-2 border border-border rounded-lg hover:bg-[#f1e7d5]"
                  >
                    Add
                  </button>
                </div>

                {/* LIST */}
                <div className="mt-3 space-y-2">
                  {formData.whatsIncluded.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-[#efe6d6] px-3 py-2 rounded-lg text-sm"
                    >
                      <span>✓ {item}</span>

                      <button
                        type="button"
                        onClick={() => removeIncludedItem(index)}
                        className="text-red-600 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

              </div>

              {/* FOOTER BUTTONS */}
              <div className="border-t border-border pt-6 flex gap-4">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-border bg-background text-text rounded-xl py-3 hover:bg-background/70 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white rounded-xl py-3 shadow-md hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Adding Product..." : "Add Product"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-card w-162.5 rounded-2xl p-8 max-h-[90vh] overflow-y-auto shadow-xl">

            <h2 className="text-2xl font-bold text-text mb-4">
              Edit product details
            </h2>

            {error && (
              <div className="bg-red-100 text-red-700 border border-red-300 rounded-xl px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* IMAGE UPLOAD */}
              <div>
                <label className="block font-medium text-text mb-2">
                  Product Images <span className="text-primary">*</span>
                </label>

                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:bg-background transition"
                >
                  <p className="text-text font-medium">
                    Click to upload images
                  </p>
                  <p className="text-sm text-muted mt-1">
                    You can select multiple images (PNG, JPG, up to 5MB each)
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {(existingImages.length > 0 || formData.images.length > 0) && (
                <div className="grid grid-cols-3 gap-4 mt-4">

                  {/* Existing Images */}
                  {existingImages.map((img, index) => (
                    <div key={img.url} className="relative">
                      <img
                        src={img.url}
                        alt="existing"
                        className="w-full h-24 object-cover rounded-xl border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Newly Uploaded Images */}
                  {formData.images.map((img, index) => (
                    <div key={img.preview} className="relative">
                      <img
                        src={img.preview}
                        alt="new"
                        className="w-full h-24 object-cover rounded-xl border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                </div>
                )}
              </div>

              {/* PRODUCT NAME */}
              <div>
                <label className="block font-medium text-text mb-2">
                  Product Name <span className="text-primary">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Handmade Ceramic Mug"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={120}
                  className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
                />

                <div className="flex justify-between text-xs mt-2 text-muted">
                  <span>Choose a clear, descriptive name</span>
                  <span>{formData.name.length}/120</span>
                </div>
              </div>

              {/* CATEGORY + PRICE */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block font-medium text-text mb-2">
                    Category <span className="text-primary">*</span>
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
                  >
                    <option value="">Select Category *</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-text mb-2">
                    Price (₹) <span className="text-primary">*</span>
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-3 text-muted">₹</span>
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full border border-border bg-background rounded-xl pl-8 pr-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
                    />
                  </div>
                </div>

              </div>

              {/* CONDITION + STOCK (Optional) */}
              <div className="grid grid-cols-2 gap-4">

                {/* CONDITION */}
                <div>
                  <label className="block font-medium text-text mb-2">
                    Condition
                  </label>

                  <select
                    name="condition"
                    value={formData.condition || ""}
                    onChange={handleChange}
                    className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
                  >
                    <option value="">Select Condition</option>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>

                  <p className="text-xs text-muted mt-2">
                    Choose New/Used condition or leave empty
                  </p>
                </div>

                {/* STOCK */}
                <div>
                  <label className="block font-medium text-text mb-2">
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    name="stock"
                    placeholder="Default: 1"
                    value={formData.stock || ""}
                    onChange={handleChange}
                    min="1"
                    className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
                  />

                  <p className="text-xs text-muted mt-2">
                    Leave empty to set default stock (1)
                  </p>
                </div>

              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block font-medium text-text mb-2">
                  Description <span className="text-primary">*</span>
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe your product in detail. Include materials, dimensions, care instructions, etc."
                  className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text resize-none"
                />
              </div>

              {/* WHAT'S INCLUDED */}
              <div className="mt-0.5">

                <label className="block text-sm font-medium mb-2">
                  What's Included
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={includedInput}
                    onChange={(e) => setIncludedInput(e.target.value)}
                    placeholder="Example: Source files"
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm"
                  />

                  <button
                    type="button"
                    onClick={addIncludedItem}
                    className="px-3 py-2 border border-border rounded-lg hover:bg-[#f1e7d5]"
                  >
                    Add
                  </button>
                </div>

                {/* LIST */}
                <div className="mt-3 space-y-2">
                  {formData.whatsIncluded.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-[#efe6d6] px-3 py-2 rounded-lg text-sm"
                    >
                      <span>✓ {item}</span>

                      <button
                        type="button"
                        onClick={() => removeIncludedItem(index)}
                        className="text-red-600 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

              </div>

              {/* FOOTER BUTTONS */}
              <div className="border-t border-border pt-6 flex gap-4">

                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-border bg-background text-text rounded-xl py-3 hover:bg-background/70 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white rounded-xl py-3 shadow-md hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Editing Product..." : "Edit Product"}
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

const ProductCardSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl shadow-sm animate-pulse">
    <div className="h-44 bg-[#efe6d6] rounded-t-2xl" />
    <div className="p-6 space-y-4">
      <div className="h-6 w-2/3 rounded bg-background" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-background" />
        <div className="h-4 w-5/6 rounded bg-background" />
      </div>
      <div className="flex gap-3">
        <div className="h-7 w-24 rounded-full bg-background" />
        <div className="h-7 w-20 rounded-full bg-background" />
      </div>
      <div className="grid grid-cols-3 gap-4 rounded-xl bg-[#efe6d6] border border-border p-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="space-y-2">
            <div className="h-3 w-12 rounded bg-white/70" />
            <div className="h-4 w-14 rounded bg-white" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="h-8 w-20 rounded bg-background" />
        <div className="h-5 w-16 rounded bg-background" />
      </div>
      <div className="flex gap-3 pt-2">
        <div className="h-10 flex-1 rounded-xl bg-background" />
        <div className="h-10 flex-1 rounded-xl bg-background" />
      </div>
    </div>
  </div>
);
