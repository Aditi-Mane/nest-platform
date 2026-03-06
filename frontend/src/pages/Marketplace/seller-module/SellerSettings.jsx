// import React, { useState } from "react";

// const SellerSettings = () => {
//   const [notifications, setNotifications] = useState({
//     newOrders: true,
//     lowStock: true,
//     marketing: false,
//     messages: true,
//   });

//   const toggle = (key) => {
//     setNotifications({ ...notifications, [key]: !notifications[key] });
//   };

//   return (
//     <div className="min-h-screen bg-background text-text">
//       <div className="max-w-6xl mx-auto px-10 py-10 space-y-8">

//         {/* HEADER */}
//         <div>
//           <h1 className="text-3xl font-bold text-primary">Settings</h1>
//           <p className="mt-1 text-sm text-muted">
//             Manage your store, profile and payment preferences
//           </p>
//         </div>

//         {/* STORE INFORMATION */}
//         <Section title="Store Information">
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="Store Name" defaultValue="My NEST Store" />
//             <Input label="Store URL" defaultValue="nest.com/store/myneststore" />
//           </div>
//           <TextArea
//             label="Store Description"
//             defaultValue="Handcrafted goods made with love"
//           />
//         </Section>

//         {/* PROFILE INFORMATION */}
//         <Section title="Profile Information">
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="First Name" defaultValue="John" />
//             <Input label="Last Name" defaultValue="Doe" />
//           </div>
//           <Input label="Email Address" defaultValue="john.doe@example.com" />
//           <Input label="Phone Number" defaultValue="+1 234 567 8900" />
//         </Section>

//         {/* BANK DETAILS */}
//         <Section title="Bank / Payment Details">
//           <Input label="Account Holder Name" defaultValue="John Doe" />
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="Bank Account Number" defaultValue="****1234" />
//             <Input label="Routing Number" defaultValue="****5678" />
//           </div>
//           <Input label="UPI ID (Optional)" placeholder="username@upi" />
//         </Section>

//         {/* NOTIFICATION PREFERENCES */}
//         <Section title="Notification Preferences">
//           <Toggle
//             title="New Orders"
//             desc="Get notified when you receive a new order"
//             checked={notifications.newOrders}
//             onClick={() => toggle("newOrders")}
//           />
//           <Toggle
//             title="Low Stock Alerts"
//             desc="Get notified when products are running low"
//             checked={notifications.lowStock}
//             onClick={() => toggle("lowStock")}
//           />
//           <Toggle
//             title="Marketing Updates"
//             desc="Receive tips and updates to grow your store"
//             checked={notifications.marketing}
//             onClick={() => toggle("marketing")}
//           />
//           <Toggle
//             title="Customer Messages"
//             desc="Get notified when buyers send you messages"
//             checked={notifications.messages}
//             onClick={() => toggle("messages")}
//           />
//         </Section>

//         {/* BUTTONS */}
//         <div className="flex justify-end gap-4 pt-2">
//           <button className="px-6 py-2 rounded-full border border-border bg-card hover:bg-background transition">
//             Cancel
//           </button>
//           <button className="px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-md hover:opacity-90 transition">
//             Save Changes
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// /* ---------- REUSABLE COMPONENTS ---------- */

// const Section = ({ title, children }) => (
//   <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
//     <div className="flex items-center mb-6">
//       <div className="w-1.5 h-6 bg-primary rounded mr-3"></div>
//       <h2 className="text-lg font-semibold text-text">{title}</h2>
//     </div>
//     <div className="space-y-5">{children}</div>
//   </div>
// );

// const Input = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm mb-1 text-muted">{label}</label>
//     <input
//       {...props}
//       className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
//     />
//   </div>
// );

// const TextArea = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm mb-1 text-muted">{label}</label>
//     <textarea
//       {...props}
//       className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition min-h-[100px]"
//     />
//   </div>
// );

// const Toggle = ({ title, desc, checked, onClick }) => (
//   <div className="flex items-center justify-between py-3">
//     <div>
//       <div className="font-medium text-text">{title}</div>
//       <div className="text-sm text-muted">{desc}</div>
//     </div>
//     <div
//       onClick={onClick}
//       className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
//         checked ? "bg-primary" : "bg-border"
//       }`}
//     >
//       <div
//         className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
//           checked ? "translate-x-6" : ""
//         }`}
//       />
//     </div>
//   </div>
// );

// export default SellerSettings;

// import React, { useState } from "react";
// import { MdDelete } from "react-icons/md";


// const SellerSettings = () => {
//   const [profileImage, setProfileImage] = useState(
//     "https://i.pravatar.cc/150?img=12"
//   );

//   const [notifications, setNotifications] = useState({
//     newOrders: true,
//     lowStock: true,
//     marketing: false,
//     messages: true,
//   });

//   const toggle = (key) => {
//     setNotifications({ ...notifications, [key]: !notifications[key] });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setProfileImage(URL.createObjectURL(file));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background text-text">
//       <div className="max-w-6xl mx-auto px-10 py-10 space-y-8">

//        {/* HEADER ROW */}
// <div className="flex items-center justify-between">

//   {/* LEFT SIDE */}
//   <div>
//     <h1 className="text-3xl font-bold text-primary">Settings</h1>
//     <p className="text-sm text-muted mt-1">
//       Manage your store, profile and payment preferences
//     </p>
//   </div>

//   {/* RIGHT SIDE */}
//   <div className="flex items-center gap-4">

//     <div className="text-right">
//       <h2 className="text-sm font-semibold text-text">John Doe</h2>
//       <p className="text-xs text-muted">john.doe@example.com</p>
//     </div>

//     <div className="relative">
//       <img
//         src={profileImage}
//         alt="Profile"
//         className="w-16 h-16 rounded-full object-cover border-2 border-border"
//       />

//       {/* EDIT BUTTON */}
//       <label className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full cursor-pointer shadow">
//         Edit
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleImageChange}
//           className="hidden"
//         />
//       </label>

//       {/* DELETE BUTTON */}
//       {profileImage && (
//         <button
//           onClick={() =>
//             setProfileImage("https://i.pravatar.cc/150?img=12")
//           }
//           className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow hover:bg-red-600 transition"
//         >
//           <MdDelete />
//         </button>
//       )}
//     </div>

//   </div>
// </div>

//         {/* STORE INFORMATION */}
//         <Section title="Store Information">
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="Store Name" defaultValue="My NEST Store" />
//             <Input label="Store URL" defaultValue="nest.com/store/myneststore" />
//           </div>
//           <TextArea
//             label="Store Description"
//             defaultValue="Handcrafted goods made with love"
//           />
//         </Section>

//         {/* PROFILE INFORMATION */}
//         <Section title="Profile Information">
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="First Name" defaultValue="John" />
//             <Input label="Last Name" defaultValue="Doe" />
//           </div>
//           <Input label="Email Address" defaultValue="john.doe@example.com" />
//           <Input label="Phone Number" defaultValue="+1 234 567 8900" />
//         </Section>

//         {/* BANK DETAILS */}
//         <Section title="Bank / Payment Details">
//           <Input label="Account Holder Name" defaultValue="John Doe" />
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="Bank Account Number" defaultValue="****1234" />
//             <Input label="Routing Number" defaultValue="****5678" />
//           </div>
//           <Input label="UPI ID (Optional)" placeholder="username@upi" />
//         </Section>

//         {/* NOTIFICATIONS */}
//         <Section title="Notification Preferences">
//           <Toggle
//             title="New Orders"
//             desc="Get notified when you receive a new order"
//             checked={notifications.newOrders}
//             onClick={() => toggle("newOrders")}
//           />
//           <Toggle
//             title="Low Stock Alerts"
//             desc="Get notified when products are running low"
//             checked={notifications.lowStock}
//             onClick={() => toggle("lowStock")}
//           />
//           <Toggle
//             title="Marketing Updates"
//             desc="Receive tips and updates to grow your store"
//             checked={notifications.marketing}
//             onClick={() => toggle("marketing")}
//           />
//           <Toggle
//             title="Customer Messages"
//             desc="Get notified when buyers send you messages"
//             checked={notifications.messages}
//             onClick={() => toggle("messages")}
//           />
//         </Section>

//         {/* BUTTONS */}
//         <div className="flex justify-end gap-4 pt-2">
//           <button className="px-6 py-2 rounded-full border border-border bg-card hover:bg-background transition">
//             Cancel
//           </button>
//           <button className="px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-md hover:opacity-90 transition">
//             Save Changes
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// /* ---------- COMPONENTS ---------- */

// const Section = ({ title, children }) => (
//   <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
//     <div className="flex items-center mb-6">
//       <div className="w-1.5 h-6 bg-primary rounded mr-3"></div>
//       <h2 className="text-lg font-semibold text-text">{title}</h2>
//     </div>
//     <div className="space-y-5">{children}</div>
//   </div>
// );

// const Input = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm mb-1 text-muted">{label}</label>
//     <input
//       {...props}
//       className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
//     />
//   </div>
// );

// const TextArea = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm mb-1 text-muted">{label}</label>
//     <textarea
//       {...props}
//       className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition min-h-[100px]"
//     />
//   </div>
// );

// const Toggle = ({ title, desc, checked, onClick }) => (
//   <div className="flex items-center justify-between py-3">
//     <div>
//       <div className="font-medium text-text">{title}</div>
//       <div className="text-sm text-muted">{desc}</div>
//     </div>
//     <div
//       onClick={onClick}
//       className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
//         checked ? "bg-primary" : "bg-border"
//       }`}
//     >
//       <div
//         className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
//           checked ? "translate-x-6" : ""
//         }`}
//       />
//     </div>
//   </div>
// );

// export default SellerSettings;

// import React, { useState } from "react";

// const SellerSettings = () => {
//   const [notifications, setNotifications] = useState({
//     newOrders: true,
//     lowStock: true,
//     marketing: false,
//     messages: true,
//   });

//   const [profileImage, setProfileImage] = useState(null);

//   const toggle = (key) => {
//     setNotifications({ ...notifications, [key]: !notifications[key] });
//   };

//   /* -------- IMAGE UPLOAD -------- */

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const imageURL = URL.createObjectURL(file);
//       setProfileImage(imageURL);
//     }
//   };

//   const handleDeleteImage = () => {
//     setProfileImage(null);
//   };

//   return (
//     <div className="min-h-screen bg-background text-text">
//       <div className="max-w-6xl mx-auto px-10 py-10 space-y-8">

//         {/* HEADER */}
//         <div>
//           <h1 className="text-3xl font-bold text-primary">Settings</h1>
//           <p className="mt-1 text-sm text-muted">
//             Manage your store, profile and payment preferences
//           </p>
//         </div>

//         {/* STORE INFORMATION */}
//         <Section title="Store Information">
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="Store Name" defaultValue="My NEST Store" />
//             <Input label="Store URL" defaultValue="nest.com/store/myneststore" />
//           </div>
//           <TextArea
//             label="Store Description"
//             defaultValue="Handcrafted goods made with love"
//           />
//         </Section>

//         {/* PROFILE INFORMATION */}
//         <Section title="Profile Information">
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="First Name" defaultValue="John" />
//             <Input label="Last Name" defaultValue="Doe" />
//           </div>
//           <Input label="Email Address" defaultValue="john.doe@example.com" />
//           <Input label="Phone Number" defaultValue="+1 234 567 8900" />
//         </Section>

//         {/* PROFILE SETTINGS */}
//         <Section title="Profile Settings">
          
//           {/* Profile Photo */}
//           <div className="flex items-center gap-6">
//             <div className="w-24 h-24 rounded-full overflow-hidden bg-border flex items-center justify-center text-muted text-sm">
//               {profileImage ? (
//                 <img
//                   src={profileImage}
//                   alt="Profile"
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 "Profile Image"
//               )}
//             </div>

//             <div className="flex flex-col gap-2">
//               <label className="px-5 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition cursor-pointer text-center">
//                 Upload Photo
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   className="hidden"
//                 />
//               </label>

//               {profileImage && (
//                 <button
//                   onClick={handleDeleteImage}
//                   className="px-5 py-2 rounded-full border border-red-400 text-red-500 text-sm hover:bg-red-50 transition"
//                 >
//                   Delete Photo
//                 </button>
//               )}

//               <p className="text-xs text-muted">
//                 JPG, PNG allowed. Max size 2MB
//               </p>
//             </div>
//           </div>

//           {/* Change Password */}
//           <div className="grid grid-cols-2 gap-6 mt-4">
//             <Input label="Current Password" type="password" />
//             <Input label="New Password" type="password" />
//           </div>

//           <Input label="Confirm New Password" type="password" />

//           {/* Danger Zone */}
//           <div className="pt-4 border-t border-border">
//             <button className="text-red-500 font-medium hover:underline text-sm">
//               Delete Account
//             </button>
//           </div>

//         </Section>

//         {/* BANK DETAILS */}
//         <Section title="Bank / Payment Details">
//           <Input label="Account Holder Name" defaultValue="John Doe" />
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="Bank Account Number" defaultValue="****1234" />
//             <Input label="Routing Number" defaultValue="****5678" />
//           </div>
//           <Input label="UPI ID (Optional)" placeholder="username@upi" />
//         </Section>

//         {/* NOTIFICATION PREFERENCES */}
//         <Section title="Notification Preferences">
//           <Toggle
//             title="New Orders"
//             desc="Get notified when you receive a new order"
//             checked={notifications.newOrders}
//             onClick={() => toggle("newOrders")}
//           />
//           <Toggle
//             title="Low Stock Alerts"
//             desc="Get notified when products are running low"
//             checked={notifications.lowStock}
//             onClick={() => toggle("lowStock")}
//           />
//           <Toggle
//             title="Marketing Updates"
//             desc="Receive tips and updates to grow your store"
//             checked={notifications.marketing}
//             onClick={() => toggle("marketing")}
//           />
//           <Toggle
//             title="Customer Messages"
//             desc="Get notified when buyers send you messages"
//             checked={notifications.messages}
//             onClick={() => toggle("messages")}
//           />
//         </Section>

//         {/* BUTTONS */}
//         <div className="flex justify-end gap-4 pt-2">
//           <button className="px-6 py-2 rounded-full border border-border bg-card hover:bg-background transition">
//             Cancel
//           </button>
//           <button className="px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-md hover:opacity-90 transition">
//             Save Changes
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// /* ---------- REUSABLE COMPONENTS ---------- */

// const Section = ({ title, children }) => (
//   <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
//     <div className="flex items-center mb-6">
//       <div className="w-1.5 h-6 bg-primary rounded mr-3"></div>
//       <h2 className="text-lg font-semibold text-text">{title}</h2>
//     </div>
//     <div className="space-y-5">{children}</div>
//   </div>
// );

// const Input = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm mb-1 text-muted">{label}</label>
//     <input
//       {...props}
//       className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
//     />
//   </div>
// );

// const TextArea = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm mb-1 text-muted">{label}</label>
//     <textarea
//       {...props}
//       className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition min-h-[100px]"
//     />
//   </div>
// );

// const Toggle = ({ title, desc, checked, onClick }) => (
//   <div className="flex items-center justify-between py-3">
//     <div>
//       <div className="font-medium text-text">{title}</div>
//       <div className="text-sm text-muted">{desc}</div>
//     </div>
//     <div
//       onClick={onClick}
//       className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
//         checked ? "bg-primary" : "bg-border"
//       }`}
//     >
//       <div
//         className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
//           checked ? "translate-x-6" : ""
//         }`}
//       />
//     </div>
//   </div>
// );

// export default SellerSettings;


// import React, { useState } from "react";
// // import { MdDelete } from "react-icons/md";
// import { MdDelete, MdEdit, MdSwapHoriz } from "react-icons/md";

// const SellerSettings = () => {
//   const [profileImage, setProfileImage] = useState(
//     "https://i.pravatar.cc/150?img=12"
//   );

//   const [showProfileMenu, setShowProfileMenu] = useState(false);

//   const [notifications, setNotifications] = useState({
//     newOrders: true,
//     lowStock: true,
//     marketing: false,
//     messages: true,
//   });

//   const toggle = (key) => {
//     setNotifications({ ...notifications, [key]: !notifications[key] });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setProfileImage(URL.createObjectURL(file));
//       setShowProfileMenu(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background text-text">
//       <div className="max-w-6xl mx-auto px-10 py-10 space-y-8">

//         {/* HEADER ROW */}
//         <div className="flex items-center justify-between">

//           {/* LEFT SIDE */}
//           <div>
//             <h1 className="text-3xl font-bold text-primary">Settings</h1>
//             <p className="text-sm text-muted mt-1">
//               Manage your store, profile and payment preferences
//             </p>
//           </div>

//           {/* RIGHT SIDE */}
//           <div className="flex items-center gap-4">

//             <div className="text-right">
//               <h2 className="text-sm font-semibold text-text">John Doe</h2>
//               <p className="text-xs text-muted">john.doe@example.com</p>
//             </div>

//             <div className="relative">

//               <img
//                 src={profileImage}
//                 alt="Profile"
//                 className="w-16 h-16 rounded-full object-cover border-2 border-border"
//               />

//               {/* PROFILE BUTTON */}
//               <button
//                 onClick={() => setShowProfileMenu(!showProfileMenu)}
//                 className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-3 py-1 rounded-full shadow"
//               >
//                 Profile
//               </button>

//               {/* DROPDOWN MENU */}
//          {showProfileMenu && (
//   <div className="absolute right-0 mt-6 w-44 bg-card border border-border rounded-lg shadow-md p-2 space-y-2">

//     {/* EDIT PROFILE */}
//     <label className="flex items-center gap-2 text-sm text-text cursor-pointer hover:text-primary transition">
//       <MdEdit />
//       Edit Profile
//       <input
//         type="file"
//         accept="image/*"
//         onChange={handleImageChange}
//         className="hidden"
//       />
//     </label>

//     {/* DELETE PROFILE */}
//     <button
//       onClick={() => {
//         setProfileImage("https://i.pravatar.cc/150?img=12");
//         setShowProfileMenu(false);
//       }}
//       className="flex items-center gap-2 text-sm text-text hover:text-primary transition"
//     >
//       <MdDelete />
//       Delete Profile
//     </button>

//     {/* SWITCH ROLE */}
//     <button
//       onClick={() => {
//         alert("Switch Role Clicked");
//         setShowProfileMenu(false);
//       }}
//       className="flex items-center gap-2 text-sm text-text hover:text-primary transition"
//     >
//       <MdSwapHoriz />
//       Switch Role
//     </button>

//   </div>
// )}
//             </div>

//           </div>
//         </div>

//         {/* STORE INFORMATION */}
//         <Section title="Store Information">
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="Store Name" defaultValue="My NEST Store" />
//             <Input label="Store URL" defaultValue="nest.com/store/myneststore" />
//           </div>
//           <TextArea
//             label="Store Description"
//             defaultValue="Handcrafted goods made with love"
//           />
//         </Section>

//         {/* PROFILE INFORMATION */}
//         <Section title="Profile Information">
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="First Name" defaultValue="John" />
//             <Input label="Last Name" defaultValue="Doe" />
//           </div>
//           <Input label="Email Address" defaultValue="john.doe@example.com" />
//           <Input label="Phone Number" defaultValue="+1 234 567 8900" />
//         </Section>

//         {/* BANK DETAILS */}
//         <Section title="Bank / Payment Details">
//           <Input label="Account Holder Name" defaultValue="John Doe" />
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="Bank Account Number" defaultValue="****1234" />
//             <Input label="Routing Number" defaultValue="****5678" />
//           </div>
//           <Input label="UPI ID (Optional)" placeholder="username@upi" />
//         </Section>

//         {/* NOTIFICATIONS */}
//         <Section title="Notification Preferences">
//           <Toggle
//             title="New Orders"
//             desc="Get notified when you receive a new order"
//             checked={notifications.newOrders}
//             onClick={() => toggle("newOrders")}
//           />
//           <Toggle
//             title="Low Stock Alerts"
//             desc="Get notified when products are running low"
//             checked={notifications.lowStock}
//             onClick={() => toggle("lowStock")}
//           />
//           <Toggle
//             title="Marketing Updates"
//             desc="Receive tips and updates to grow your store"
//             checked={notifications.marketing}
//             onClick={() => toggle("marketing")}
//           />
//           <Toggle
//             title="Customer Messages"
//             desc="Get notified when buyers send you messages"
//             checked={notifications.messages}
//             onClick={() => toggle("messages")}
//           />
//         </Section>

//         {/* BUTTONS */}
//         <div className="flex justify-end gap-4 pt-2">
//           <button className="px-6 py-2 rounded-full border border-border bg-card hover:bg-background transition">
//             Cancel
//           </button>
//           <button className="px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-md hover:opacity-90 transition">
//             Save Changes
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// /* ---------- COMPONENTS ---------- */

// const Section = ({ title, children }) => (
//   <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
//     <div className="flex items-center mb-6">
//       <div className="w-1.5 h-6 bg-primary rounded mr-3"></div>
//       <h2 className="text-lg font-semibold text-text">{title}</h2>
//     </div>
//     <div className="space-y-5">{children}</div>
//   </div>
// );

// const Input = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm mb-1 text-muted">{label}</label>
//     <input
//       {...props}
//       className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
//     />
//   </div>
// );

// const TextArea = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm mb-1 text-muted">{label}</label>
//     <textarea
//       {...props}
//       className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition min-h-[100px]"
//     />
//   </div>
// );

// const Toggle = ({ title, desc, checked, onClick }) => (
//   <div className="flex items-center justify-between py-3">
//     <div>
//       <div className="font-medium text-text">{title}</div>
//       <div className="text-sm text-muted">{desc}</div>
//     </div>
//     <div
//       onClick={onClick}
//       className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
//         checked ? "bg-primary" : "bg-border"
//       }`}
//     >
//       <div
//         className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
//           checked ? "translate-x-6" : ""
//         }`}
//       />
//     </div>
//   </div>
// );

// export default SellerSettings;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { MdDelete, MdEdit, MdSwapHoriz } from "react-icons/md";

// const SellerSettings = () => {

//   const [profileImage, setProfileImage] = useState(
//     "https://i.pravatar.cc/150?img=12"
//   );

//   const [showProfileMenu, setShowProfileMenu] = useState(false);

//   const [notifications, setNotifications] = useState({
//     newOrders: true,
//     lowStock: true,
//     marketing: false,
//     messages: true,
//   });

//   const toggle = (key) => {
//     setNotifications({ ...notifications, [key]: !notifications[key] });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setProfileImage(URL.createObjectURL(file));
//       setShowProfileMenu(false);
//     }
//   };

//   /* ==============================
//       LOAD USER DATA FROM DATABASE
//      ============================== */
//     useEffect(() => {

//       const fetchUserSettings = async () => {
//         try {

//           const token = localStorage.getItem("token");

//           const res = await axios.get(
//             "http://localhost:5000/api/users/me",
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`
//               }
//             }
//           );

//           const user = res.data;

//           // set profile image
//           if(user.avatar){
//             setProfileImage(user.avatar);
//           }

//           // set notifications
//           if(user.notifications){
//             setNotifications(user.notifications);
//           }

//         } catch (error) {
//           console.log("Error loading settings:", error);
//         }
//       };

//       fetchUserSettings();

//     }, []);


//   /* ==============================
//         SAVE SETTINGS TO DATABASE
//      ============================== */

//   const handleSave = async () => {

//   try {

//     const token = localStorage.getItem("token");

//     await axios.put(
//       "http://localhost:5000/api/users/update-settings",
//       {
//         avatar: profileImage,
//         notifications
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       }
//     );

//     alert("Settings saved successfully");

//   } catch (error) {
//     console.log("Save settings error:", error);
//   }

// };

//   /* ============================== */

//   return (
//     <div className="min-h-screen bg-background text-text">
//       <div className="max-w-6xl mx-auto px-10 py-10 space-y-8">

//         {/* HEADER ROW */}
//         <div className="flex items-center justify-between">

//           <div>
//             <h1 className="text-3xl font-bold text-primary">Settings</h1>
//             <p className="text-sm text-muted mt-1">
//               Manage your store, profile and payment preferences
//             </p>
//           </div>

//           <div className="flex items-center gap-4">

//             <div className="text-right">
//               <h2 className="text-sm font-semibold text-text">John Doe</h2>
//               <p className="text-xs text-muted">john.doe@example.com</p>
//             </div>

//             <div className="relative">

//               <img
//                 src={profileImage}
//                 alt="Profile"
//                 className="w-16 h-16 rounded-full object-cover border-2 border-border"
//               />

//               <button
//                 onClick={() => setShowProfileMenu(!showProfileMenu)}
//                 className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-3 py-1 rounded-full shadow"
//               >
//                 Profile
//               </button>

//               {showProfileMenu && (
//                 <div className="absolute right-0 mt-6 w-44 bg-card border border-border rounded-lg shadow-md p-2 space-y-2">

//                   <label className="flex items-center gap-2 text-sm text-text cursor-pointer hover:text-primary transition">
//                     <MdEdit />
//                     Edit Profile
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       className="hidden"
//                     />
//                   </label>

//                   <button
//                     onClick={() => {
//                       setProfileImage("https://i.pravatar.cc/150?img=12");
//                       setShowProfileMenu(false);
//                     }}
//                     className="flex items-center gap-2 text-sm text-text hover:text-primary transition"
//                   >
//                     <MdDelete />
//                     Delete Profile
//                   </button>

//                   <button
//                     onClick={() => {
//                       alert("Switch Role Clicked");
//                       setShowProfileMenu(false);
//                     }}
//                     className="flex items-center gap-2 text-sm text-text hover:text-primary transition"
//                   >
//                     <MdSwapHoriz />
//                     Switch Role
//                   </button>

//                 </div>
//               )}

//             </div>

//           </div>
//         </div>


//         {/* STORE INFORMATION */}
//         <Section title="Store Information">
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="Store Name" defaultValue="My NEST Store" />
//             <Input label="Store URL" defaultValue="nest.com/store/myneststore" />
//           </div>
//           <TextArea
//             label="Store Description"
//             defaultValue="Handcrafted goods made with love"
//           />
//         </Section>


//         {/* PROFILE INFORMATION */}
//         <Section title="Profile Information">
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="First Name" defaultValue="John" />
//             <Input label="Last Name" defaultValue="Doe" />
//           </div>
//           <Input label="Email Address" defaultValue="john.doe@example.com" />
//           <Input label="Phone Number" defaultValue="+1 234 567 8900" />
//         </Section>


//         {/* BANK DETAILS */}
//         <Section title="Bank / Payment Details">
//           <Input label="Account Holder Name" defaultValue="John Doe" />
//           <div className="grid grid-cols-2 gap-6">
//             <Input label="Bank Account Number" defaultValue="****1234" />
//             <Input label="Routing Number" defaultValue="****5678" />
//           </div>
//           <Input label="UPI ID (Optional)" placeholder="username@upi" />
//         </Section>


//         {/* NOTIFICATIONS */}
//         <Section title="Notification Preferences">
//           <Toggle
//             title="New Orders"
//             desc="Get notified when you receive a new order"
//             checked={notifications.newOrders}
//             onClick={() => toggle("newOrders")}
//           />
//           <Toggle
//             title="Low Stock Alerts"
//             desc="Get notified when products are running low"
//             checked={notifications.lowStock}
//             onClick={() => toggle("lowStock")}
//           />
//           <Toggle
//             title="Marketing Updates"
//             desc="Receive tips and updates to grow your store"
//             checked={notifications.marketing}
//             onClick={() => toggle("marketing")}
//           />
//           <Toggle
//             title="Customer Messages"
//             desc="Get notified when buyers send you messages"
//             checked={notifications.messages}
//             onClick={() => toggle("messages")}
//           />
//         </Section>


//         {/* BUTTONS */}
//         <div className="flex justify-end gap-4 pt-2">
//           <button className="px-6 py-2 rounded-full border border-border bg-card hover:bg-background transition">
//             Cancel
//           </button>

//           {/* <button
//             onClick={handleSave}
//             className="px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-md hover:opacity-90 transition"
//           >
//             Save Changes
//           </button> */}

//           <button
//             onClick={handleSave}
//             className="px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-md hover:opacity-90 transition"
//           >
//             Save Changes
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };


// /* ---------- COMPONENTS ---------- */

// const Section = ({ title, children }) => (
//   <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
//     <div className="flex items-center mb-6">
//       <div className="w-1.5 h-6 bg-primary rounded mr-3"></div>
//       <h2 className="text-lg font-semibold text-text">{title}</h2>
//     </div>
//     <div className="space-y-5">{children}</div>
//   </div>
// );

// const Input = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm mb-1 text-muted">{label}</label>
//     <input
//       {...props}
//       className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
//     />
//   </div>
// );

// const TextArea = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm mb-1 text-muted">{label}</label>
//     <textarea
//       {...props}
//       className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition min-h-[100px]"
//     />
//   </div>
// );

// const Toggle = ({ title, desc, checked, onClick }) => (
//   <div className="flex items-center justify-between py-3">
//     <div>
//       <div className="font-medium text-text">{title}</div>
//       <div className="text-sm text-muted">{desc}</div>
//     </div>
//     <div
//       onClick={onClick}
//       className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
//         checked ? "bg-primary" : "bg-border"
//       }`}
//     >
//       <div
//         className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
//           checked ? "translate-x-6" : ""
//         }`}
//       />
//     </div>
//   </div>
// );

// export default SellerSettings;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdDelete, MdEdit, MdSwapHoriz } from "react-icons/md";

const SellerSettings = () => {

  const [profileImage, setProfileImage] = useState(
    "https://i.pravatar.cc/150?img=12"
  );

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    marketing: false,
    messages: true,
  });

  /* NEW STATES (ADDED) */

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [payoutUPI, setPayoutUPI] = useState("");

  const toggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setShowProfileMenu(false);
    }
  };

  /* ==============================
      LOAD USER DATA FROM DATABASE
     ============================== */

  useEffect(() => {

    const fetchUserSettings = async () => {
      try {

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const user = res.data;

        if(user.avatar) setProfileImage(user.avatar);

        if(user.notifications) setNotifications(user.notifications);

        /* NEW DATA LOAD */

        if(user.storeName) setStoreName(user.storeName);

        if(user.storeDescription) setStoreDescription(user.storeDescription);

        if(user.storeLocation) setStoreLocation(user.storeLocation);

        if(user.payoutUPI) setPayoutUPI(user.payoutUPI);

      } catch (error) {
        console.log("Error loading settings:", error);
      }
    };

    fetchUserSettings();

  }, []);


  /* ==============================
        SAVE SETTINGS TO DATABASE
     ============================== */

  const handleSave = async () => {

    try {

      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/api/users/update-settings",
        {
          avatar: profileImage,
          storeName,
          storeDescription,
          storeLocation,
          payoutUPI,
          notifications
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Settings saved successfully");

    } catch (error) {
      console.log("Save settings error:", error);
    }

  };


  return (
    <div className="min-h-screen bg-background text-text">
      <div className="max-w-6xl mx-auto px-10 py-10 space-y-8">

        {/* HEADER ROW */}
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-primary">Settings</h1>
            <p className="text-sm text-muted mt-1">
              Manage your store, profile and payment preferences
            </p>
          </div>

          <div className="flex items-center gap-4">

            <div className="text-right">
              <h2 className="text-sm font-semibold text-text">John Doe</h2>
              <p className="text-xs text-muted">john.doe@example.com</p>
            </div>

            <div className="relative">

              <img
                src={profileImage}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-border"
              />

              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-3 py-1 rounded-full shadow"
              >
                Profile
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-6 w-44 bg-card border border-border rounded-lg shadow-md p-2 space-y-2">

                  <label className="flex items-center gap-2 text-sm text-text cursor-pointer hover:text-primary transition">
                    <MdEdit />
                    Edit Profile
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      setProfileImage("https://i.pravatar.cc/150?img=12");
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center gap-2 text-sm text-text hover:text-primary transition"
                  >
                    <MdDelete />
                    Delete Profile
                  </button>

                  <button
                    onClick={() => {
                      alert("Switch Role Clicked");
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center gap-2 text-sm text-text hover:text-primary transition"
                  >
                    <MdSwapHoriz />
                    Switch Role
                  </button>

                </div>
              )}

            </div>

          </div>
        </div>


        {/* STORE INFORMATION */}
        <Section title="Store Information">
          <div className="grid grid-cols-2 gap-6">

            <Input
              label="Store Name"
              value={storeName}
              onChange={(e)=>setStoreName(e.target.value)}
            />

            <Input
              label="Store Location"
              value={storeLocation}
              onChange={(e)=>setStoreLocation(e.target.value)}
            />

          </div>

          <TextArea
            label="Store Description"
            value={storeDescription}
            onChange={(e)=>setStoreDescription(e.target.value)}
          />
        </Section>


        {/* PROFILE INFORMATION */}
        <Section title="Profile Information">
          <div className="grid grid-cols-2 gap-6">
            <Input label="First Name" defaultValue="John" />
            <Input label="Last Name" defaultValue="Doe" />
          </div>
          <Input label="Email Address" defaultValue="john.doe@example.com" />
          <Input label="Phone Number" defaultValue="+1 234 567 8900" />
        </Section>


        {/* BANK DETAILS */}
        <Section title="Bank / Payment Details">

          <Input label="Account Holder Name" defaultValue="John Doe" />

          <div className="grid grid-cols-2 gap-6">
            <Input label="Bank Account Number" defaultValue="****1234" />
            <Input label="Routing Number" defaultValue="****5678" />
          </div>

          <Input
            label="UPI ID (Optional)"
            value={payoutUPI}
            onChange={(e)=>setPayoutUPI(e.target.value)}
          />

        </Section>


        {/* NOTIFICATIONS */}
        <Section title="Notification Preferences">

          <Toggle
            title="New Orders"
            desc="Get notified when you receive a new order"
            checked={notifications.newOrders}
            onClick={() => toggle("newOrders")}
          />

          <Toggle
            title="Low Stock Alerts"
            desc="Get notified when products are running low"
            checked={notifications.lowStock}
            onClick={() => toggle("lowStock")}
          />

          <Toggle
            title="Marketing Updates"
            desc="Receive tips and updates to grow your store"
            checked={notifications.marketing}
            onClick={() => toggle("marketing")}
          />

          <Toggle
            title="Customer Messages"
            desc="Get notified when buyers send you messages"
            checked={notifications.messages}
            onClick={() => toggle("messages")}
          />

        </Section>


        {/* BUTTONS */}
        <div className="flex justify-end gap-4 pt-2">

          <button className="px-6 py-2 rounded-full border border-border bg-card hover:bg-background transition">
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-md hover:opacity-90 transition"
          >
            Save Changes
          </button>

        </div>

      </div>
    </div>
  );
};