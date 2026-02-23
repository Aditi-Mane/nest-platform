// import React from "react";

// const ReusableCard = ({ product }) => {
//   const low = product.stock <= 5;

//   return (
//     <div className="product-card">
//       <div className="image">{product.image}</div>

//       <div className="content">
//         <div className="title-row">
//           <h3>{product.name}</h3>
//           <span className={`status ${low ? "low" : "active"}`}>
//             {low ? "Low Stock" : "Active"}
//           </span>
//         </div>

//         <p className="desc">{product.description}</p>

//         <div className="rating">
//           ⭐ {product.rating} ({product.reviews})
//         </div>

//         <div className="stats">
//           <div>
//             <p>Sales</p>
//             <strong>{product.sales}</strong>
//           </div>
//           <div>
//             <p>Revenue</p>
//             <strong>${product.revenue}</strong>
//           </div>
//           <div>
//             <p>Views</p>
//             <strong>{product.views}</strong>
//           </div>
//           <div>
//             <p>Conv. Rate</p>
//             <strong>{product.conversion}%</strong>
//           </div>
//         </div>

//         <div className="bottom">
//           <h2>${product.price}</h2>
//           <span className={low ? "stock low" : "stock"}>
//             Stock: {product.stock}
//           </span>
//         </div>

//         <button className="edit-btn">Edit</button>
//       </div>
//     </div>
//   );
// };

// export default ReusableCard;


// import React from "react";
// import { FiEdit2, FiTrash2, FiMoreVertical } from "react-icons/fi";

// const ReusableCard = ({ product }) => {
//   const low = product.stock <= 5;

//   return (
//     <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:shadow-md transition duration-200 overflow-hidden">

//       {/* IMAGE */}
//       <div className="h-44 bg-[#efe6d6] overflow-hidden">
//         {product.image && product.image.length > 10 ? (
//           <img
//             src={product.image}
//             alt={product.name}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="flex items-center justify-center h-full text-5xl">
//             {product.image}
//           </div>
//         )}
//       </div>

//       <div className="p-5">

//         {/* TITLE + STATUS */}
//         <div className="flex justify-between items-start">
//           <h3 className="text-lg font-semibold text-[var(--color-text)]">
//             {product.name}
//           </h3>

//           <span
//             className={`text-xs px-3 py-1 rounded-full ${
//               low
//                 ? "bg-red-100 text-red-600"
//                 : "bg-green-100 text-green-700"
//             }`}
//           >
//             {low ? "Low Stock" : "Active"}
//           </span>
//         </div>

//         {/* DESCRIPTION */}
//         <p className="text-sm text-[var(--color-muted)] mt-2">
//           {product.description}
//         </p>

//         {/* CATEGORY + RATING */}
//         <div className="flex items-center gap-3 mt-3">
//           <span className="text-xs px-3 py-1 bg-[#efe6d6] rounded-full border border-[var(--color-border)]">
//             {product.category}
//           </span>
//           <span className="text-sm text-[var(--color-primary)]">
//             ⭐ {product.rating} ({product.reviews})
//           </span>
//         </div>

//         {/* STATS BOX */}
//         <div className="grid grid-cols-2 gap-4 mt-4 bg-[#efe6d6] rounded-xl p-4 border border-[var(--color-border)] text-sm">
//           <div>
//             <p className="text-[var(--color-muted)]">Sales</p>
//             <strong>{product.sales}</strong>
//           </div>
//           <div>
//             <p className="text-[var(--color-muted)]">Revenue</p>
//             <strong className="text-green-700">${product.revenue}</strong>
//           </div>
//           <div>
//             <p className="text-[var(--color-muted)]">Views</p>
//             <strong>{product.views}</strong>
//           </div>
//           <div>
//             <p className="text-[var(--color-muted)]">Conv. Rate</p>
//             <strong>{product.conversion}%</strong>
//           </div>
//         </div>

//         {/* PRICE + STOCK */}
//         <div className="flex justify-between items-center mt-5">
//           <h2 className="text-2xl font-bold text-[var(--color-primary)]">
//             ${product.price}
//           </h2>
//           <span className={`text-sm ${low ? "text-red-500" : "text-[var(--color-muted)]"}`}>
//             Stock: {product.stock}
//           </span>
//         </div>

//         {/* ACTIONS */}
//         <div className="flex items-center gap-3 mt-4">
//           <button className="flex-1 flex items-center justify-center gap-2 border border-[var(--color-border)] rounded-xl py-2 hover:bg-[#f1e7d5] transition">
//             <FiEdit2 size={16} />
//             Edit
//           </button>

//           <button className="p-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition">
//             <FiTrash2 size={16} />
//           </button>

//           <button className="p-2 border border-[var(--color-border)] rounded-xl hover:bg-[#f1e7d5] transition">
//             <FiMoreVertical size={16} />
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default ReusableCard;

import React from "react";
import { FiEdit2, FiTrash2, FiMoreVertical } from "react-icons/fi";

const ReusableCard = ({ product }) => {
  const low = product.stock <= 5;

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:shadow-md transition duration-200">

      {/* IMAGE */}
      <div className="h-44 bg-[#efe6d6] flex items-center justify-center overflow-hidden rounded-t-2xl">
        {product.image && product.image.length > 10 ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">{product.image}</span>
        )}
      </div>

      <div className="p-6">

        {/* TITLE + STATUS */}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">
            {product.name}
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
        <p className="text-sm text-[var(--color-muted)] mt-3">
          {product.description}
        </p>

        {/* CATEGORY + RATING */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-xs px-3 py-1 rounded-full border border-[var(--color-border)] bg-[#efe6d6]">
            {product.category}
          </span>

          <span className="text-sm text-[var(--color-primary)]">
            ⭐ {product.rating} ({product.reviews})
          </span>
        </div>

        {/* STATS BOX */}
        <div className="grid grid-cols-2 gap-6 mt-5 bg-[#efe6d6] border border-[var(--color-border)] rounded-xl p-5 text-sm">

          <div>
            <p className="text-[var(--color-muted)]">Sales</p>
            <p className="font-semibold mt-1">{product.sales}</p>
          </div>

          <div>
            <p className="text-[var(--color-muted)]">Revenue</p>
            <p className="font-semibold text-green-700 mt-1">
              ${product.revenue}
            </p>
          </div>

          <div>
            <p className="text-[var(--color-muted)]">Views</p>
            <p className="font-semibold mt-1">{product.views}</p>
          </div>

          {/* <div>
            <p className="text-[var(--color-muted)]">Conv. Rate</p>
            <p className="font-semibold mt-1">
              {product.conversion}%
            </p>
          </div> */}

        </div>

        {/* PRICE + STOCK */}
        <div className="flex justify-between items-center mt-6">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">
            ${product.price}
          </h2>

          <span
            className={`text-sm ${
              low ? "text-red-500" : "text-[var(--color-muted)]"
            }`}
          >
            Stock: {product.stock}
          </span>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between mt-5">

          <button className="flex-1 flex items-center justify-center gap-2 border border-[var(--color-border)] rounded-xl py-3 hover:bg-[#f1e7d5] transition">
            <FiEdit2 size={16} />
            Edit
          </button>

          <div className="flex items-center gap-4 ml-4">
            <FiTrash2 className="cursor-pointer hover:text-red-500" size={18} />
            <FiMoreVertical className="cursor-pointer hover:text-[var(--color-primary)]" size={18} />
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReusableCard;