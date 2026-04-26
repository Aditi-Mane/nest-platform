import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import SellerSidebar from "../../../components/SellerSidebar.jsx";

const pageTitles = {
  "/marketplace/seller/dashboard": "Dashboard",
  "/marketplace/seller/messages": "Buyer Requests",
  "/marketplace/seller/products": "My Products",
  "/marketplace/seller/orders": "Order History",
  "/marketplace/seller/analytics": "Analytics",
  "/marketplace/seller/sales-prediction": "Sales Prediction",
  "/marketplace/seller/sentiment": "Sentiment Analysis",
  "/marketplace/seller/settings": "Settings",
};

const SellerPanel = () => {
  const location = useLocation();
  const containerRef = useRef(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const pageTitle = useMemo(() => {
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }

    if (location.pathname.startsWith("/marketplace/seller/messages/")) {
      return "Conversation";
    }

    if (location.pathname.startsWith("/marketplace/seller/orders/")) {
      return "Verify OTP";
    }

    return "Seller Module";
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden h-screen shrink-0 lg:block">
        <SellerSidebar />
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close seller menu"
            onClick={() => setMobileNavOpen(false)}
          />

          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col shadow-2xl">
            <div className="flex items-center justify-end border-b border-border bg-card px-4 py-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl p-2 text-muted transition hover:bg-background hover:text-text"
                aria-label="Close seller menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SellerSidebar className="w-full border-r-0" onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="rounded-xl border border-border bg-background p-2 text-text shadow-sm transition hover:border-primary hover:text-primary"
                aria-label="Open seller menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-text">{pageTitle}</p>
                <p className="text-xs text-muted">Seller workspace</p>
              </div>
            </div>

            <img
              src="/NEST_logo.png"
              alt="NEST"
              className="h-10 w-10 shrink-0 rounded-xl border border-border bg-background p-1.5"
            />
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto bg-background px-4 py-4 sm:px-6 lg:px-6"
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SellerPanel;
