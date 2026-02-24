// import { NavLink } from "react-router-dom";

// const SellerNavbar = () => {
//   const linkStyle =
//     "px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)]";

//   const activeStyle =
//     "px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-primary)] text-white";

//   return (
//     <div className="sticky top-0 z-50 bg-card border-b border-primary">
//       <div className="flex items-center justify-between px-6 py-3">
        
//         {/* LEFT */}
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
//             📦
//           </div>
//           <h1 className="font-bold text-lg">Seller Panel</h1>
//         </div>

//         {/* CENTER LINKS */}
//         <div className="hidden md:flex items-center gap-2">
//           <NavLink
//             to="/marketplace/seller/dashboard"
//             className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
//           >
//             Dashboard
//           </NavLink>

//           <NavLink
//             to="/marketplace/seller/products"
//             className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
//           >
//             Products
//           </NavLink>

//           <NavLink
//             to="/marketplace/seller/orders"
//             className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
//           >
//             Orders
//           </NavLink>

//           <NavLink
//             to="/marketplace/seller/analytics"
//             className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
//           >
//             Analytics
//           </NavLink>

//           <NavLink
//             to="/marketplace/seller/ai"
//             className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
//           >
//             AI Insights
//           </NavLink>

//           <NavLink
//             to="/marketplace/seller/messages"
//             className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
//           >
//             Messages
//           </NavLink>

//           <NavLink
//             to="/marketplace/seller/payments"
//             className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
//           >
//             Payments
//           </NavLink>

          
//         </div>

//         {/* RIGHT */}
//         <div className="flex items-center gap-4">
//           <button className="text-xl">🔔</button>
//           <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
//             S
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SellerNavbar;

// import React, { useState } from "react";
// import { NavLink } from "react-router-dom";
// import { GoPackage } from "react-icons/go";
// import { MdOutlineAnalytics } from "react-icons/md";
// import { TbPackage } from "react-icons/tb";
// import { LuClipboardList } from "react-icons/lu";
// import { DiGoogleAnalytics } from "react-icons/di";
// import { LiaRobotSolid } from "react-icons/lia";
// import { MdAnalytics } from "react-icons/md";
// import { FaRegSmile } from "react-icons/fa";
// import { LuMessageSquare } from "react-icons/lu";
// import { MdOutlinePayment } from "react-icons/md";
// import { IoSettingsSharp } from "react-icons/io5";

// const SellerSidebar = () => {
//   const [openAI, setOpenAI] = useState(true);

//   // Slightly increased font size
//   const baseLink =
//     "flex items-center gap-3 px-4 py-2 rounded-xl text-[15px] font-medium transition-all";

//   const activeLink =
//     "bg-[#efe6d6] text-[var(--color-primary)]";

//   const normalLink =
//     "text-[var(--color-muted)] hover:bg-[#f4ecdd]";

//   return (
//     <div className="w-72 h-screen bg-[var(--color-card)] border-r border-[var(--color-border)] flex flex-col justify-between">

//       {/* TOP SECTION */}
//       <div>
//         {/* LOGO AREA */}
//         <div className="flex items-center gap-3 p-5 border-b border-[var(--color-border)]">
//           <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center text-lg">
//             <GoPackage size={27}/>
//           </div>
//           <div>
//             <h1 className="font-bold text-lg">NEST</h1>
//             <p className="text-sm text-[var(--color-muted)]">
//               Seller Dashboard
//             </p>
//           </div>
//         </div>

//         {/* MENU */}
//         <div className="p-4 space-y-3">
//           <NavLink
//             to="/seller/dashboard"
//             className={({ isActive }) =>
//               `${baseLink} ${isActive ? activeLink : normalLink}`
//             }
//           >
//             <MdOutlineAnalytics /> Dashboard
//           </NavLink>

//           <NavLink
//             to="/seller/setup"
//             className={({ isActive }) =>
//               `${baseLink} ${isActive ? activeLink : normalLink}`
//             }
//           >
//             <TbPackage /> Products
//           </NavLink>

//           <NavLink
//             to="/seller/orders"
//             className={({ isActive }) =>
//               `${baseLink} ${isActive ? activeLink : normalLink}`
//             }
//           >
//             <LuClipboardList /> Orders
//           </NavLink>

//           <NavLink
//             to="/seller/analytics"
//             className={({ isActive }) =>
//               `${baseLink} ${isActive ? activeLink : normalLink}`
//             }
//           >
//             <DiGoogleAnalytics />  Analytics
//           </NavLink>

//           {/* AI SECTION */}
//           <div className="pt-1">
//             <button
//               onClick={() => setOpenAI(!openAI)}
//               className={`${baseLink} ${normalLink} w-full justify-between`}
//             >
//               <div className="flex items-center gap-3">
//                 <LiaRobotSolid /> AI Insights
//                 <span className="text-xs bg-[#efe6d6] text-[var(--color-primary)] px-2 py-0.5 rounded-full">
//                   AI
//                 </span>
//               </div>
//               <span>{openAI ? "▾" : "▸"}</span>
//             </button>

//             {openAI && (
//               <div className="ml-6 mt-1 space-y-1">
//                 <NavLink
//                   to="/seller/sales-prediction"
//                   className={({ isActive }) =>
//                     `${baseLink} ${
//                       isActive ? activeLink : normalLink
//                     }`
//                   }
//                 >
//                   <MdAnalytics /> Sales Prediction
//                 </NavLink>

//                 <NavLink
//                   to="/seller/sentiment"
//                   className={({ isActive }) =>
//                     `${baseLink} ${
//                       isActive ? activeLink : normalLink
//                     }`
//                   }
//                 >
//                   <FaRegSmile /> Sentiment Analysis
//                 </NavLink>
//               </div>
//             )}
//           </div>

//           <NavLink
//             to="/seller/messages"
//             className={({ isActive }) =>
//               `${baseLink} ${isActive ? activeLink : normalLink}`
//             }
//           >
//             <LuMessageSquare /> Messages
//           </NavLink>

//           <NavLink
//             to="/seller/payments"
//             className={({ isActive }) =>
//               `${baseLink} ${isActive ? activeLink : normalLink}`
//             }
//           >
//             <MdOutlinePayment /> Payments
//           </NavLink>

//           <NavLink
//             to="/seller/settings"
//             className={({ isActive }) =>
//               `${baseLink} ${isActive ? activeLink : normalLink}`
//             }
//           >
//             <IoSettingsSharp /> Settings
//           </NavLink>

//         </div>
//       </div>

//       {/* PROFILE */}
//       <div className="p-4 border-t border-[var(--color-border)]">
//         <div className="flex items-center gap-3 bg-[#efe6d6] p-3 rounded-xl">
//           <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
//             S
//           </div>
//           <div>
//             <p className="font-medium text-sm">Seller Name</p>
//             <p className="text-xs text-[var(--color-muted)]">
//               seller@example.com
//             </p>
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default SellerSidebar;

import { useState } from "react";
import { NavLink } from "react-router-dom";
import { GoPackage } from "react-icons/go";
import { MdOutlineAnalytics } from "react-icons/md";
import { TbPackage } from "react-icons/tb";
import { LiaRobotSolid } from "react-icons/lia";
import { MdAnalytics } from "react-icons/md";
import { FaRegSmile } from "react-icons/fa";
import { MdOutlinePayment } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { MdReplay } from "react-icons/md";
import { SiGoogleanalytics } from "react-icons/si";
import { IoPeople } from "react-icons/io5";


import { useEffect } from "react";
import api from "../api/axios.js";

const SellerSidebar = () => {
  const [openAI, setOpenAI] = useState(true);
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/users/me");
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  const baseLink =
    "flex items-center gap-3 px-4 py-2 rounded-xl text-[15px] font-medium transition-all duration-200";

  const activeLink =
    "bg-[#efe6d6] text-[var(--color-primary)] font-semibold";

  const normalLink =
    "text-[var(--color-muted)] hover:bg-[#f4ecdd] hover:text-[var(--color-primary)]";

  return (
    <div className="w-72 h-screen bg-card border-r border-border flex flex-col justify-between">

      {/* TOP SECTION */}
      <div>
        {/* LOGO */}
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-lg">
            <GoPackage size={27} />
          </div>
          <div>
            <h1 className="font-bold text-lg">NEST</h1>
            <p className="text-sm text-muted">
              Seller Dashboard
            </p>
          </div>
        </div>

        {/* MENU */}
        <div className="p-4 space-y-3">

          <NavLink
            to="/marketplace/seller/dashboard"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <MdOutlineAnalytics size={20} />
            Dashboard
          </NavLink>

          <NavLink
            to="/marketplace/seller/messages"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <IoPeople size={20}/>
            Buyer Requests
          </NavLink>

          <NavLink
            to="/marketplace/seller/products"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <TbPackage size={20}/>
            My Products
          </NavLink>

          <NavLink
            to="/marketplace/seller/orders"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <MdReplay size={20}/>
            Order History
          </NavLink>

          <NavLink
            to="/marketplace/seller/analytics"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <SiGoogleanalytics size={20}/>
            Analytics
          </NavLink>

          {/* AI SECTION */}
          <div className="pt-1">
            <button
              onClick={() => setOpenAI(!openAI)}
              className={`${baseLink} ${normalLink} w-full justify-between`}
            >
              <div className="flex items-center gap-3">
                <LiaRobotSolid size={20} />
                AI Insights
                <span className="text-xs bg-[#efe6d6] text-primary px-2 py-0.5 rounded-full">
                  AI
                </span>
              </div>
              <span>{openAI ? "▾" : "▸"}</span>
            </button>

            {openAI && (
              <div className="ml-6 mt-1 space-y-1">
                <NavLink
                  to="/marketplace/seller/sales-prediction"
                  className={({ isActive }) =>
                    `${baseLink} ${
                      isActive ? activeLink : normalLink
                    }`
                  }
                >
                  <MdAnalytics size={18} />
                  Sales Prediction
                </NavLink>

                <NavLink
                  to="/marketplace/seller/sentiment"
                  className={({ isActive }) =>
                    `${baseLink} ${
                      isActive ? activeLink : normalLink
                    }`
                  }
                >
                  <FaRegSmile size={18} />
                  Sentiment Analysis
                </NavLink>
              </div>
            )}
          </div>

          {/* <NavLink
            to="/marketplace/seller/messages"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <LuMessageSquare size={20} />
            Messages
          </NavLink> */}

          <NavLink
            to="/marketplace/seller/payments"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <MdOutlinePayment size={20} />
            Payments
          </NavLink>

          <NavLink
            to="/marketplace/seller/settings"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <IoSettingsSharp size={20} />
            Settings
          </NavLink>

        </div>
      </div>

      {/* PROFILE */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 bg-[#efe6d6] p-3 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
            {user?.name?.[0]}
          </div>
          <div>
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-muted">
              {user.email}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SellerSidebar;