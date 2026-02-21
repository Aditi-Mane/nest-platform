import { Outlet } from "react-router-dom";
import SellerSidebar from "../../../components/SellerSidebar.jsx";

const SellerPanel = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* LEFT SIDEBAR (FIXED) */}
      <div className="w-72 h-screen shrink-0">
        <SellerSidebar />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col h-screen">

        {/* SCROLLABLE CONTENT ONLY */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default SellerPanel;