// import { Outlet } from "react-router-dom"
// import SellerNavbar from "../../../components/SellerSidebar.jsx"

// const SellerPanel = () => {
//   return (
//     <>
//       <SellerNavbar/>
//       <Outlet/>
//     </>
//   )
// }

// export default SellerPanel

import { Outlet } from "react-router-dom";
import SellerSidebar from "../../../components/SellerSidebar.jsx";
import { IoNotificationsOutline } from "react-icons/io5";

const SellerPanel = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      
      {/* LEFT SIDEBAR (FIXED) */}
      <div className="w-72 h-screen flex-shrink-0">
        <SellerSidebar />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col h-screen">

        {/* TOP HEADER */}
        <div className="h-16 bg-[var(--color-card)] border-b border-[var(--color-border)] flex items-center justify-end px-6">
          <div className="relative">
            <IoNotificationsOutline
              size={22}
              className="text-[var(--color-muted)]"
            />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-primary)] rounded-full"></span>
          </div>
        </div>

        {/* SCROLLABLE CONTENT ONLY */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default SellerPanel;