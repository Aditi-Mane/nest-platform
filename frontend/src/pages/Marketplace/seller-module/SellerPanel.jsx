// import { Outlet } from "react-router-dom";
// import SellerSidebar from "../../../components/SellerSidebar.jsx";

// const SellerPanel = () => {
//   return (
//     <div className="flex h-screen overflow-hidden bg-background">
      
//       {/* LEFT SIDEBAR (FIXED) */}
//       <div className="w-72 h-screen shrink-0">
//         <SellerSidebar />
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="flex-1 flex flex-col h-screen">

//         {/* SCROLLABLE CONTENT ONLY */}
//         <div className="flex-1 overflow-y-auto p-6">
//           <Outlet />
//         </div>

//       </div>
//     </div>
//   );
// };

// export default SellerPanel;

import { Outlet } from "react-router-dom";
import SellerSidebar from "../../../components/SellerSidebar.jsx";
import { FaRegBell } from "react-icons/fa6";

const SellerPanel = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* LEFT SIDEBAR (FIXED) */}
      <div className="w-72 h-screen shrink-0">
        <SellerSidebar />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col h-screen">

        {/* 🔥 TOP HORIZONTAL BAR (ONLY RIGHT SIDE) */}
        <div className="h-14 bg-[#f3eadc] border-b border-[#d4b896] flex items-center justify-end px-6">
          
          {/* Notification Icon */}
          <div className="relative">
            <span className="text-xl"><FaRegBell /></span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#c96b2c] rounded-full"></span>
          </div>

        </div>

        {/* SCROLLABLE CONTENT ONLY */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#e8dcc9]">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default SellerPanel;