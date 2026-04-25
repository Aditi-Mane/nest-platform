import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import SellerSidebar from "../../../components/SellerSidebar.jsx";
import { Menu, X } from "lucide-react";

const SellerPanel = () => {
  const location = useLocation();
  const containerRef = useRef(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // 🔥 Reset scroll whenever route changes
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* MOBILE DRAWER BACKDROP */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR - DRAWER ON MOBILE */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-72 h-screen shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SellerSidebar onClose={() => setIsDrawerOpen(false)} />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col h-screen">

        {/* MOBILE HEADER WITH HAMBURGER */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-lg hover:bg-border/50 transition-colors"
          >
            <Menu size={24} className="text-text" />
          </button>
          <div className="flex items-center gap-3">
            <img
              src="/NEST_logo.png"  
              alt="NEST Logo"
              className="size-8 object-contain"
            />
            <h1 className="font-bold text-lg text-text">NEST</h1>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* SCROLLABLE CONTENT ONLY */}
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 bg-background">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default SellerPanel;