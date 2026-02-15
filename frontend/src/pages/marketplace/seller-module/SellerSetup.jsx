
// const SellerSetup = () => {
//   return (
//     <div>
//       seller setup
//     </div>
//   )
// }

// export default SellerSetup


// import React from "react";
// import products from "../../../../../backend/src/models/sellerProduct";
// import ProductsHeader from "../../../components/ProductHeader";
// import ProductsFilter from "../../../components/ProductFilter";
// import ProductCard from "../../../components/ReusableCard";

// const SellerSetup = () => {
//   const lowStock = products.filter((p) => p.stock <= 5).length;
//   const revenue = products.reduce((a, b) => a + b.revenue, 0);

//   return (
//     <div className="p-6 bg-[var(--color-background)] min-h-screen text-[var(--color-text)]">
      
//       {/* HEADER */}
//       <div className="flex justify-between items-start mb-6">
//         <div>
//           <h1 className="text-3xl font-bold">Products</h1>
//           <p className="text-[var(--color-muted)]">
//             Manage your product inventory and performance
//           </p>
//           <p className="mt-1 text-sm">
//             {products.length} products • {lowStock} low stock alerts
//           </p>
//         </div>

//         <button className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg shadow">
//           + Add Product
//         </button>
//       </div>

//       {/* FILTERS */}
//       <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl mb-6 flex gap-4">
//         <input
//           className="flex-1 border border-[var(--color-border)] rounded-lg px-4 py-2"
//           placeholder="Search products..."
//         />

//         <select className="border border-[var(--color-border)] rounded-lg px-3 py-2">
//           <option>All Categories</option>
//         </select>

//         <select className="border border-[var(--color-border)] rounded-lg px-3 py-2">
//           <option>Sort by Sales</option>
//         </select>
//       </div>

//       {/* GRID */}
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {products.map((p) => {
//           const low = p.stock <= 5;

//           return (
//             <div
//               key={p.id}
//               className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm"
//             >
//               {/* IMAGE */}
//               <div className="h-48 flex items-center justify-center text-5xl bg-[#efe6d6]">
//                 {p.image}
//               </div>

//               {/* CONTENT */}
//               <div className="p-4">
//                 <div className="flex justify-between items-center">
//                   <h3 className="font-semibold text-lg">{p.name}</h3>
//                   <span
//                     className={`text-xs px-2 py-1 rounded-full ${
//                       low
//                         ? "bg-red-100 text-red-600"
//                         : "bg-green-100 text-green-700"
//                     }`}
//                   >
//                     {low ? "Low Stock" : "Active"}
//                   </span>
//                 </div>

//                 <p className="text-sm text-[var(--color-muted)] mt-1">
//                   {p.description}
//                 </p>

//                 <p className="mt-2 text-sm">
//                   ⭐ {p.rating} ({p.reviews})
//                 </p>

//                 {/* STATS */}
//                 <div className="grid grid-cols-2 gap-3 mt-3 text-sm border rounded-lg p-3">
//                   <div>
//                     <p className="text-[var(--color-muted)]">Sales</p>
//                     <p className="font-semibold">{p.sales}</p>
//                   </div>
//                   <div>
//                     <p className="text-[var(--color-muted)]">Revenue</p>
//                     <p className="font-semibold">${p.revenue}</p>
//                   </div>
//                   <div>
//                     <p className="text-[var(--color-muted)]">Views</p>
//                     <p>{p.views}</p>
//                   </div>
//                   <div>
//                     <p className="text-[var(--color-muted)]">Conv. Rate</p>
//                     <p>{p.conversion}%</p>
//                   </div>
//                 </div>

//                 {/* PRICE */}
//                 <div className="flex justify-between items-center mt-4">
//                   <p className="text-xl font-bold text-[var(--color-primary)]">
//                     ${p.price}
//                   </p>
//                   <p className={low ? "text-red-500" : ""}>
//                     Stock: {p.stock}
//                   </p>
//                 </div>

//                 <button className="mt-3 w-full border border-[var(--color-border)] rounded-lg py-2 hover:bg-[#f1e7d5]">
//                   Edit
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default SellerSetup;

// import React, { useState } from "react";
// import productsData from "../../../../../backend/src/models/sellerProduct";
// import sellerNavbar from "../../../components/SellerNavbar";
// import ProductsHeader from "../../../components/ProductHeader";
// import ProductsFilter from "../../../components/ProductFilter";
// import ProductCard from "../../../components/ReusableCard";

// const SellerSetup = () => {
//   // 👇 keeping your logic but making it reactive for delete
//   const [products, setProducts] = useState(productsData);

//   const lowStock = products.filter((p) => p.stock <= 5).length;
//   const revenue = products.reduce((a, b) => a + b.revenue, 0);
//   const avgRating =
//     products.length > 0
//       ? products.reduce((a, b) => a + b.rating, 0) / products.length
//       : 0;

//   // delete handler
//   const handleDelete = (id) => {
//     if (window.confirm("Delete this product?")) {
//       setProducts(products.filter((p) => p.id !== id));
//     }
//   };

//   return (
//     <div className="p-6 bg-[var(--color-background)] min-h-screen text-[var(--color-text)]">
      
//       {/* HEADER */}
//       <div className="flex justify-between items-start mb-6">
//         <div>
//           <h1 className="text-3xl font-bold">Products</h1>
//           <p className="text-[var(--color-muted)]">
//             Manage your product inventory and performance
//           </p>
//           <p className="mt-1 text-sm">
//             {products.length} products • {lowStock} low stock alerts
//           </p>
//         </div>

//         <button className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg shadow">
//           + Add Product
//         </button>
//       </div>

//       {/* ✅ STATS CARDS ADDED */}
//       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
//           <p className="text-sm text-[var(--color-muted)]">Total Products</p>
//           <h2 className="text-2xl font-bold">{products.length}</h2>
//         </div>

//         <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
//           <p className="text-sm text-[var(--color-muted)]">Total Revenue</p>
//           <h2 className="text-2xl font-bold">${revenue}</h2>
//         </div>

//         <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
//           <p className="text-sm text-[var(--color-muted)]">Low Stock</p>
//           <h2 className="text-2xl font-bold text-red-500">{lowStock}</h2>
//         </div>

//         <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
//           <p className="text-sm text-[var(--color-muted)]">Avg Rating</p>
//           <h2 className="text-2xl font-bold">⭐ {avgRating.toFixed(1)}</h2>
//         </div>
//       </div>

//       {/* FILTERS */}
//       <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl mb-6 flex gap-4">
//         <input
//           className="flex-1 border border-[var(--color-border)] rounded-lg px-4 py-2"
//           placeholder="Search products..."
//         />

//         <select className="border border-[var(--color-border)] rounded-lg px-3 py-2">
//           <option>All Categories</option>
//         </select>

//         <select className="border border-[var(--color-border)] rounded-lg px-3 py-2">
//           <option>Sort by Sales</option>
//         </select>
//       </div>

//       {/* GRID */}
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {products.map((p) => {
//           const low = p.stock <= 5;

//           return (
//             <div
//               key={p.id}
//               className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm"
//             >
//               {/* IMAGE */}
//               <div className="h-48 flex items-center justify-center text-5xl bg-[#efe6d6]">
//                 {p.image}
//               </div>

//               {/* CONTENT */}
//               <div className="p-4">
//                 <div className="flex justify-between items-center">
//                   <h3 className="font-semibold text-lg">{p.name}</h3>
//                   <span
//                     className={`text-xs px-2 py-1 rounded-full ${
//                       low
//                         ? "bg-red-100 text-red-600"
//                         : "bg-green-100 text-green-700"
//                     }`}
//                   >
//                     {low ? "Low Stock" : "Active"}
//                   </span>
//                 </div>

//                 <p className="text-sm text-[var(--color-muted)] mt-1">
//                   {p.description}
//                 </p>

//                 <p className="mt-2 text-sm">
//                   ⭐ {p.rating} ({p.reviews})
//                 </p>

//                 {/* STATS */}
//                 <div className="grid grid-cols-2 gap-3 mt-3 text-sm border rounded-lg p-3">
//                   <div>
//                     <p className="text-[var(--color-muted)]">Sales</p>
//                     <p className="font-semibold">{p.sales}</p>
//                   </div>
//                   <div>
//                     <p className="text-[var(--color-muted)]">Revenue</p>
//                     <p className="font-semibold">${p.revenue}</p>
//                   </div>
//                   <div>
//                     <p className="text-[var(--color-muted)]">Views</p>
//                     <p>{p.views}</p>
//                   </div>
//                   <div>
//                     <p className="text-[var(--color-muted)]">Conv. Rate</p>
//                     <p>{p.conversion}%</p>
//                   </div>
//                 </div>

//                 {/* PRICE */}
//                 <div className="flex justify-between items-center mt-4">
//                   <p className="text-xl font-bold text-[var(--color-primary)]">
//                     ${p.price}
//                   </p>
//                   <p className={low ? "text-red-500" : ""}>
//                     Stock: {p.stock}
//                   </p>
//                 </div>

//                 {/* ✅ ACTIONS ADDED */}
//                 <div className="flex gap-2 mt-3">
//                   <button className="flex-1 border border-[var(--color-border)] rounded-lg py-2 hover:bg-[#f1e7d5]">
//                     Edit
//                   </button>

//                   <button
//                     onClick={() => handleDelete(p.id)}
//                     className="px-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
//                   >
//                     🗑
//                   </button>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default SellerSetup;

// import React, { useState } from "react";
// import productsData from "../../../../../backend/src/models/sellerProduct";
// import SellerNavbar from "../../../components/SellerNavbar"; // ✅ FIXED NAME
// import ProductsHeader from "../../../components/ProductHeader";
// import ProductsFilter from "../../../components/ProductFilter";
// import ProductCard from "../../../components/ReusableCard";

// const SellerSetup = () => {
//   // 👇 keeping your logic but making it reactive for delete
//   const [products, setProducts] = useState(productsData);

//   const lowStock = products.filter((p) => p.stock <= 5).length;
//   const revenue = products.reduce((a, b) => a + b.revenue, 0);
//   const avgRating =
//     products.length > 0
//       ? products.reduce((a, b) => a + b.rating, 0) / products.length
//       : 0;

//   // delete handler
//   const handleDelete = (id) => {
//     if (window.confirm("Delete this product?")) {
//       setProducts(products.filter((p) => p.id !== id));
//     }
//   };

//   return (
//     <>
//       {/* ✅ NAVBAR ADDED */}
//       <SellerNavbar />

//       <div className="p-6 bg-[var(--color-background)] min-h-screen text-[var(--color-text)]">
        
//         {/* HEADER */}
//         <div className="flex justify-between items-start mb-6">
//           <div>
//             <h1 className="text-3xl font-bold">Products</h1>
//             <p className="text-[var(--color-muted)]">
//               Manage your product inventory and performance
//             </p>
//             <p className="mt-1 text-sm">
//               {products.length} products • {lowStock} low stock alerts
//             </p>
//           </div>

//           <button className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg shadow">
//             + Add Product
//           </button>
//         </div>

//         {/* STATS CARDS */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
//             <p className="text-sm text-[var(--color-muted)]">Total Products</p>
//             <h2 className="text-2xl font-bold">{products.length}</h2>
//           </div>

//           <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
//             <p className="text-sm text-[var(--color-muted)]">Total Revenue</p>
//             <h2 className="text-2xl font-bold">${revenue}</h2>
//           </div>

//           <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
//             <p className="text-sm text-[var(--color-muted)]">Low Stock</p>
//             <h2 className="text-2xl font-bold text-red-500">{lowStock}</h2>
//           </div>

//           <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
//             <p className="text-sm text-[var(--color-muted)]">Avg Rating</p>
//             <h2 className="text-2xl font-bold">⭐ {avgRating.toFixed(1)}</h2>
//           </div>
//         </div>

//         {/* FILTERS */}
//         <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl mb-6 flex gap-4">
//           <input
//             className="flex-1 border border-[var(--color-border)] rounded-lg px-4 py-2"
//             placeholder="Search products..."
//           />

//           <select className="border border-[var(--color-border)] rounded-lg px-3 py-2">
//             <option>All Categories</option>
//           </select>

//           <select className="border border-[var(--color-border)] rounded-lg px-3 py-2">
//             <option>Sort by Sales</option>
//           </select>
//         </div>

//         {/* GRID */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {products.map((p) => {
//             const low = p.stock <= 5;

//             return (
//               <div
//                 key={p.id}
//                 className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm"
//               >
//                 {/* IMAGE */}
//                 <div className="h-48 flex items-center justify-center text-5xl bg-[#efe6d6]">
//                   {p.image}
//                 </div>

//                 {/* CONTENT */}
//                 <div className="p-4">
//                   <div className="flex justify-between items-center">
//                     <h3 className="font-semibold text-lg">{p.name}</h3>
//                     <span
//                       className={`text-xs px-2 py-1 rounded-full ${
//                         low
//                           ? "bg-red-100 text-red-600"
//                           : "bg-green-100 text-green-700"
//                       }`}
//                     >
//                       {low ? "Low Stock" : "Active"}
//                     </span>
//                   </div>

//                   <p className="text-sm text-[var(--color-muted)] mt-1">
//                     {p.description}
//                   </p>

//                   <p className="mt-2 text-sm">
//                     ⭐ {p.rating} ({p.reviews})
//                   </p>

//                   {/* STATS */}
//                   <div className="grid grid-cols-2 gap-3 mt-3 text-sm border rounded-lg p-3">
//                     <div>
//                       <p className="text-[var(--color-muted)]">Sales</p>
//                       <p className="font-semibold">{p.sales}</p>
//                     </div>
//                     <div>
//                       <p className="text-[var(--color-muted)]">Revenue</p>
//                       <p className="font-semibold">${p.revenue}</p>
//                     </div>
//                     <div>
//                       <p className="text-[var(--color-muted)]">Views</p>
//                       <p>{p.views}</p>
//                     </div>
//                     <div>
//                       <p className="text-[var(--color-muted)]">Conv. Rate</p>
//                       <p>{p.conversion}%</p>
//                     </div>
//                   </div>

//                   {/* PRICE */}
//                   <div className="flex justify-between items-center mt-4">
//                     <p className="text-xl font-bold text-[var(--color-primary)]">
//                       ${p.price}
//                     </p>
//                     <p className={low ? "text-red-500" : ""}>
//                       Stock: {p.stock}
//                     </p>
//                   </div>

//                   {/* ACTIONS */}
//                   <div className="flex gap-2 mt-3">
//                     <button className="flex-1 border border-[var(--color-border)] rounded-lg py-2 hover:bg-[#f1e7d5]">
//                       Edit
//                     </button>

//                     <button
//                       onClick={() => handleDelete(p.id)}
//                       className="px-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
//                     >
//                       🗑
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </>
//   );
// };

// export default SellerSetup;

import React, { useState } from "react";
import productsData from "../../../../../backend/src/models/sellerProduct";
import SellerNavbar from "../../../components/SellerNavbar";
import ProductsHeader from "../../../components/ProductHeader";
import ProductsFilter from "../../../components/ProductFilter";
import ProductCard from "../../../components/ReusableCard";
import AddProductModal from "../../../components/AddProductModel";

const SellerSetup = () => {
  const [products, setProducts] = useState(productsData);
  const [open, setOpen] = useState(false);

  const lowStock = products.filter((p) => p.stock <= 5).length;
  const revenue = products.reduce((a, b) => a + b.revenue, 0);
  const avgRating =
    products.length > 0
      ? products.reduce((a, b) => a + b.rating, 0) / products.length
      : 0;

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <>
      <SellerNavbar />

      <div className="p-6 bg-[var(--color-background)] min-h-screen text-[var(--color-text)]">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-[var(--color-muted)]">
              Manage your product inventory and performance
            </p>
            <p className="mt-1 text-sm">
              {products.length} products • {lowStock} low stock alerts
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg shadow"
          >
            + Add Product
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
            <p className="text-sm text-[var(--color-muted)]">Total Products</p>
            <h2 className="text-2xl font-bold">{products.length}</h2>
          </div>

          <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
            <p className="text-sm text-[var(--color-muted)]">Total Revenue</p>
            <h2 className="text-2xl font-bold">${revenue}</h2>
          </div>

          <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-xl">
            <p className="text-sm text-[var(--color-muted)]">Low Stock</p>
            <h2 className="text-2xl font-bold text-red-500">{lowStock}</h2>
          </div>

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
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm"
              >
                <div className="h-48 flex items-center justify-center text-5xl bg-[#efe6d6]">
                  {p.image}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{p.name}</h3>

                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        low
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {low ? "Low Stock" : "Active"}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    {p.description}
                  </p>

                  <p className="mt-2 text-sm">
                    ⭐ {p.rating} ({p.reviews})
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xl font-bold text-[var(--color-primary)]">
                      ${p.price}
                    </p>
                    <p className={low ? "text-red-500" : ""}>
                      Stock: {p.stock}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 border border-[var(--color-border)] rounded-lg py-2 hover:bg-[#f1e7d5]">
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      <AddProductModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default SellerSetup;
