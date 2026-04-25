import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import SellerSidebar from "../../../components/SellerSidebar.jsx";

const SellerPanel = () => {
  const location = useLocation();
  const containerRef = useRef(null);

  useEffect(() => {
    // 🔥 Reset scroll whenever route changes
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* LEFT SIDEBAR (FIXED) */}
      <div className="w-72 h-screen shrink-0">
        <SellerSidebar />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col h-screen">

        {/* SCROLLABLE CONTENT ONLY */}
        <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4 bg-background">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default SellerPanel;