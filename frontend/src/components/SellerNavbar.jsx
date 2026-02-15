import React from "react";
import { NavLink } from "react-router-dom";

const SellerNavbar = () => {
  const linkStyle =
    "px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)]";

  const activeStyle =
    "px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-primary)] text-white";

  return (
    <div className="sticky top-0 z-50 bg-[var(--color-card)] border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between px-6 py-3">
        
        {/* LEFT */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white">
            📦
          </div>
          <h1 className="font-bold text-lg">Seller Panel</h1>
        </div>

        {/* CENTER LINKS */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink
            to="/seller/dashboard"
            className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/seller/setup"
            className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
          >
            Products
          </NavLink>

          <NavLink
            to="/seller/orders"
            className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
          >
            Orders
          </NavLink>

          <NavLink
            to="/seller/analytics"
            className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
          >
            Analytics
          </NavLink>

          <NavLink
            to="/seller/ai"
            className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
          >
            AI Insights
          </NavLink>

          <NavLink
            to="/seller/messages"
            className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
          >
            Messages
          </NavLink>

          <NavLink
            to="/seller/payments"
            className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
          >
            Payments
          </NavLink>

          <NavLink
            to="/seller/settings"
            className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
          >
            Settings
          </NavLink>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <button className="text-xl">🔔</button>
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
            S
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerNavbar;
