// import React from "react";

// const AddProductModal = ({ open, onClose }) => {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       {/* OVERLAY */}
//       <div
//         className="absolute inset-0 bg-black/40"
//         onClick={onClose}
//       ></div>

//       {/* MODAL */}
//       <div className="relative w-[600px] max-h-[90vh] overflow-y-auto bg-[var(--color-card)] rounded-2xl shadow-xl p-6">
//         <h2 className="text-2xl font-bold mb-1">Add New Product</h2>
//         <p className="text-[var(--color-muted)] mb-4">
//           Fill in the details below to add a new product to your store.
//         </p>

//         {/* IMAGE UPLOAD */}
//         <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 text-center mb-4">
//           <div className="text-3xl mb-2">⬆️</div>
//           <p className="font-medium">Click to upload images</p>
//           <p className="text-sm text-[var(--color-muted)]">
//             PNG, JPG up to 10MB
//           </p>
//         </div>

//         {/* NAME */}
//         <div className="mb-4">
//           <label className="font-medium">Product Name *</label>
//           <input
//             className="mt-1 w-full border border-[var(--color-border)] rounded-xl px-4 py-2"
//             placeholder="e.g., Handmade Ceramic Mug"
//           />
//         </div>

//         {/* CATEGORY + PRICE */}
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="font-medium">Category *</label>
//             <select className="mt-1 w-full border border-[var(--color-border)] rounded-xl px-4 py-2">
//               <option>Home & Living</option>
//               <option>Fashion</option>
//               <option>Stationery</option>
//             </select>
//           </div>

//           <div>
//             <label className="font-medium">Price (USD) *</label>
//             <input
//               type="number"
//               className="mt-1 w-full border border-[var(--color-border)] rounded-xl px-4 py-2"
//               placeholder="$ 0.00"
//             />
//           </div>
//         </div>

//         {/* DESCRIPTION */}
//         <div className="mb-6">
//           <label className="font-medium">Description *</label>
//           <textarea
//             rows={4}
//             className="mt-1 w-full border border-[var(--color-border)] rounded-xl px-4 py-2"
//             placeholder="Describe your product in detail..."
//           />
//         </div>

//         {/* BUTTONS */}
//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-5 py-2 rounded-xl border border-[var(--color-border)]"
//           >
//             Cancel
//           </button>

//           <button className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white">
//             + Add Product
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddProductModal;


// import React, { useRef, useState } from "react";

// const AddProductModal = ({ open, onClose }) => {
//   const fileInputRef = useRef(null);
//   const [images, setImages] = useState([]);

//   if (!open) return null;

//   const handleUploadClick = () => {
//     fileInputRef.current.click(); // opens desktop file picker
//   };

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     setImages(files);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div className="bg-[#efe6d6] w-full max-w-2xl p-6 rounded-2xl shadow-lg relative">
        
//         <h2 className="text-2xl font-bold mb-2">Add New Product</h2>
//         <p className="text-sm text-gray-600 mb-4">
//           Fill in the details below to add a new product to your store.
//         </p>

//         {/* UPLOAD BOX */}
//         <div
//           onClick={handleUploadClick}
//           className="border-2 border-dashed border-orange-300 rounded-xl p-10 text-center cursor-pointer hover:bg-[#f7efe3]"
//         >
//           <div className="text-3xl mb-2">⬆️</div>
//           <p className="font-medium">Click to upload images</p>
//           <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
//         </div>

//         {/* HIDDEN FILE INPUT */}
//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleFileChange}
//           multiple
//           accept="image/png, image/jpeg"
//           className="hidden"
//         />

//         {/* PREVIEW */}
//         {images.length > 0 && (
//           <div className="flex gap-2 mt-4 flex-wrap">
//             {images.map((file, index) => (
//               <img
//                 key={index}
//                 src={URL.createObjectURL(file)}
//                 alt="preview"
//                 className="w-16 h-16 object-cover rounded"
//               />
//             ))}
//           </div>
//         )}

//         {/* FORM FIELDS */}
//         <div className="mt-4 space-y-3">
//           <input
//             type="text"
//             placeholder="Product Name"
//             className="w-full border p-3 rounded-lg"
//           />

//           <div className="grid grid-cols-2 gap-3">
//             <select className="border p-3 rounded-lg">
//               <option>Home & Living</option>
//               <option>Electronics</option>
//               <option>Fashion</option>
//             </select>

//             <input
//               type="number"
//               placeholder="Price (USD)"
//               className="border p-3 rounded-lg"
//             />
//           </div>

//           <textarea
//             placeholder="Description"
//             className="w-full border p-3 rounded-lg"
//           />
//         </div>

//         {/* ACTIONS */}
//         <div className="flex justify-end gap-3 mt-6">
//           <button
//             onClick={onClose}
//             className="px-5 py-2 border rounded-lg"
//           >
//             Cancel
//           </button>

//           <button className="px-5 py-2 bg-orange-500 text-white rounded-lg">
//             + Add Product
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddProductModal;


// import React, { useRef, useState } from "react";

// const AddProductModal = ({ open, onClose, onAddProduct }) => {
//   const fileInputRef = useRef(null);

//   const [form, setForm] = useState({
//     name: "",
//     category: "",
//     price: "",
//     description: "",
//     image: null,
//   });

//   const [error, setError] = useState("");

//   if (!open) return null;

//   const handleUploadClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setForm({ ...form, image: file });
//     }
//   };

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = () => {
//     // ✅ Validation
//     if (
//       !form.name ||
//       !form.category ||
//       !form.price ||
//       !form.description ||
//       !form.image
//     ) {
//       setError("All fields are required.");
//       return;
//     }

//     const newProduct = {
//       id: Date.now(),
//       name: form.name,
//       description: form.description,
//       price: Number(form.price),
//       stock: 10,
//       rating: 0,
//       reviews: 0,
//       revenue: 0,
//       image: (
//         <img
//           src={URL.createObjectURL(form.image)}
//           alt="product"
//           className="h-full w-full object-cover"
//         />
//       ),
//     };

//     onAddProduct(newProduct);

//     // Reset form
//     setForm({
//       name: "",
//       category: "",
//       price: "",
//       description: "",
//       image: null,
//     });

//     setError("");
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div className="bg-[#efe6d6] w-full max-w-2xl p-6 rounded-2xl shadow-lg">

//         <h2 className="text-2xl font-bold mb-2">Add New Product</h2>
//         <p className="text-sm text-gray-600 mb-4">
//           Fill in the details below to add a new product to your store.
//         </p>

//         {/* Upload Box */}
//         <div
//           onClick={handleUploadClick}
//           className="border-2 border-dashed border-orange-300 rounded-xl p-10 text-center cursor-pointer hover:bg-[#f7efe3]"
//         >
//           <div className="text-3xl mb-2">⬆️</div>
//           <p className="font-medium">Click to upload images</p>
//           <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
//         </div>

//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleFileChange}
//           accept="image/png, image/jpeg"
//           className="hidden"
//         />

//         {/* Preview */}
//         {/* {form.image && (
//           <img
//             src={URL.createObjectURL(form.image)}
//             alt="preview"
//             className="w-24 h-24 object-cover rounded mt-3"
//           />
//         )} */}

//         {form.image && (
//   <div className="relative w-24 h-24 mt-3">
//     <img
//       src={URL.createObjectURL(form.image)}
//       alt="preview"
//       className="w-full h-full object-cover rounded"
//     />

//     {/* Delete Button */}
//     <button
//       type="button"
//       onClick={() =>
//         setForm({ ...form, image: null })
//       }
//       className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
//     >
//       ✕
//     </button>
//   </div>
// )}

//         {/* Form */}
//         <div className="mt-4 space-y-3">
//           <input
//             type="text"
//             name="name"
//             placeholder="Product Name"
//             value={form.name}
//             onChange={handleChange}
//             className="w-full border p-3 rounded-lg"
//           />

//           <div className="grid grid-cols-2 gap-3">
//             <select
//               name="category"
//               value={form.category}
//               onChange={handleChange}
//               className="border p-3 rounded-lg"
//             >
//               <option value="">Select Category</option>
//               <option>Home & Living</option>
//               <option>Electronics</option>
//               <option>Fashion</option>
//             </select>

//             <input
//               type="number"
//               name="price"
//               placeholder="Price (USD)"
//               value={form.price}
//               onChange={handleChange}
//               className="border p-3 rounded-lg"
//             />
//           </div>

//           <textarea
//             name="description"
//             placeholder="Description"
//             value={form.description}
//             onChange={handleChange}
//             className="w-full border p-3 rounded-lg"
//           />
//         </div>

//         {/* Error */}
//         {error && (
//           <p className="text-red-500 mt-3 text-sm">{error}</p>
//         )}

//         {/* Buttons */}
//         <div className="flex justify-end gap-3 mt-6">
//           <button
//             onClick={onClose}
//             className="px-5 py-2 border rounded-lg"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleSubmit}
//             className="px-5 py-2 bg-orange-500 text-white rounded-lg"
//           >
//             + Add Product
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddProductModal;

// import React, { useRef, useState } from "react";

// const AddProductModal = ({ open, onClose, onAddProduct }) => {
//   const fileInputRef = useRef(null);

//   const [form, setForm] = useState({
//     name: "",
//     category: "",
//     price: "",
//     description: "",
//     image: null,
//   });

//   const [error, setError] = useState("");

//   if (!open) return null;

//   const handleUploadClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setForm({ ...form, image: file });
//     }
//   };

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = () => {
//     // ✅ Validation
//     if (
//       !form.name ||
//       !form.category ||
//       !form.price ||
//       !form.description ||
//       !form.image
//     ) {
//       setError("All fields are required.");
//       return;
//     }

//     const newProduct = {
//       id: Date.now(),
//       name: form.name,
//       description: form.description,
//       price: Number(form.price),
//       stock: 10,
//       rating: 0,
//       reviews: 0,
//       revenue: 0,
//       image: (
//         <img
//           src={URL.createObjectURL(form.image)}
//           alt="product"
//           className="h-full w-full object-cover"
//         />
//       ),
//     };

//     onAddProduct(newProduct);

//     // Reset form
//     setForm({
//       name: "",
//       category: "",
//       price: "",
//       description: "",
//       image: null,
//     });

//     setError("");
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div className="bg-[#efe6d6] w-full max-w-2xl p-6 rounded-2xl shadow-lg">

//         <h2 className="text-2xl font-bold mb-2">Add New Product</h2>
//         <p className="text-sm text-gray-600 mb-4">
//           Fill in the details below to add a new product to your store.
//         </p>

//         {/* Upload Box */}
//         <div
//           onClick={handleUploadClick}
//           className="border-2 border-dashed border-orange-300 rounded-xl p-10 text-center cursor-pointer hover:bg-[#f7efe3]"
//         >
//           <div className="text-3xl mb-2">⬆️</div>
//           <p className="font-medium">Click to upload images</p>
//           <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
//         </div>

//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleFileChange}
//           accept="image/png, image/jpeg"
//           className="hidden"
//         />

//         {/* Preview */}
//         {/* {form.image && (
//           <img
//             src={URL.createObjectURL(form.image)}
//             alt="preview"
//             className="w-24 h-24 object-cover rounded mt-3"
//           />
//         )} */}

        

//         {/* Form */}
//         <div className="mt-4 space-y-3">
//           <input
//             type="text"
//             name="name"
//             placeholder="Product Name"
//             value={form.name}
//             onChange={handleChange}
//             className="w-full border p-3 rounded-lg"
//           />

//           <div className="grid grid-cols-2 gap-3">
//             <select
//               name="category"
//               value={form.category}
//               onChange={handleChange}
//               className="border p-3 rounded-lg"
//             >
//               <option value="">Select Category</option>
//               <option>Home & Living</option>
//               <option>Electronics</option>
//               <option>Fashion</option>
//             </select>

//             <input
//               type="number"
//               name="price"
//               placeholder="Price (USD)"
//               value={form.price}
//               onChange={handleChange}
//               className="border p-3 rounded-lg"
//             />
//           </div>

//           <textarea
//             name="description"
//             placeholder="Description"
//             value={form.description}
//             onChange={handleChange}
//             className="w-full border p-3 rounded-lg"
//           />
//         </div>

//         {/* Error */}
//         {error && (
//           <p className="text-red-500 mt-3 text-sm">{error}</p>
//         )}

//         {/* Buttons */}
//         <div className="flex justify-end gap-3 mt-6">
//           <button
//             onClick={onClose}
//             className="px-5 py-2 border rounded-lg"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleSubmit}
//             className="px-5 py-2 bg-orange-500 text-white rounded-lg"
//           >
//             + Add Product
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddProductModal;


import React, { useRef, useState } from "react";

const AddProductModal = ({ open, onClose, onAddProduct }) => {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image: null,
  });

  const [error, setError] = useState("");

  if (!open) return null;

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    // ✅ Validation
    if (
      !form.name ||
      !form.category ||
      !form.price ||
      !form.description ||
      !form.image
    ) {
      setError("All fields are required.");
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: 10,
      rating: 0,
      reviews: 0,
      revenue: 0,
      image: (
        <img
          src={URL.createObjectURL(form.image)}
          alt="product"
          className="h-full w-full object-cover"
        />
      ),
    };

    onAddProduct(newProduct);

    // Reset form
    setForm({
      name: "",
      category: "",
      price: "",
      description: "",
      image: null,
    });

    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#efe6d6] w-full max-w-2xl p-6 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-bold mb-2">Add New Product</h2>
        <p className="text-sm text-gray-600 mb-4">
          Fill in the details below to add a new product to your store.
        </p>

        {/* Upload Box */}
        <div
          onClick={handleUploadClick}
          className="border-2 border-dashed border-orange-300 rounded-xl p-10 text-center cursor-pointer hover:bg-[#f7efe3]"
        >
          <div className="text-3xl mb-2">⬆️</div>
          <p className="font-medium">Click to upload images</p>
          <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg"
          className="hidden"
        />

        {/* Preview */}
        {/* {form.image && (
          <img
            src={URL.createObjectURL(form.image)}
            alt="preview"
            className="w-24 h-24 object-cover rounded mt-3"
          />
        )} */}

        {form.image && (
  <div className="relative w-24 h-24 mt-3">
    <img
      src={URL.createObjectURL(form.image)}
      alt="preview"
      className="w-full h-full object-cover rounded"
    />

    {/* Delete Button */}
    <button
      type="button"
      onClick={() =>
        setForm({ ...form, image: null })
      }
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
    >
      ✕
    </button>
  </div>
)}


        {/* Form */}
        <div className="mt-4 space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            >
              <option value="">Select Category</option>
              <option>Home & Living</option>
              <option>Electronics</option>
              <option>Fashion</option>
            </select>

            <input
              type="number"
              name="price"
              placeholder="Price (USD)"
              value={form.price}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 mt-3 text-sm">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-orange-500 text-white rounded-lg"
          >
            + Add Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
