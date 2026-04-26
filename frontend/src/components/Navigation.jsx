import {
  Heart,
  Home,
  Lightbulb,
  Menu,
  MessageSquare,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../api/axios.js";
import { useMessages } from "@/context/MessageContext";
import { useUser } from "@/context/UserContext";
import { useCart } from "../context/CartContext.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function Navigation({ currentPage, onNavigate, wishlistCount }) {
  const navItems = [
    { id: "marketplace", label: "Home", icon: Home },
    { id: "ventures", label: "Ventures", icon: Lightbulb },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  const drawerItems = [
    ...navItems,
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "cart", label: "Cart", icon: ShoppingCart },
    { id: "profile", label: "Profile", icon: User },
  ];

  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnread } = useMessages();
  const { cartItems } = useCart();
  const { user, setUser } = useUser();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const cartCount = cartItems.length;
  useEffect(() => {
    if (!user?.avatar) {
      api
        .get("/users/me")
        .then((res) => {
          setUser(res.data);
        })
        .catch((err) => console.error(err));
    }
  }, [setUser, user?.avatar]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const handleNavClick = (id) => {
    if (id === "marketplace") {
      navigate("/marketplace/buyer/");
    }

    if (id === "ventures") {
      navigate("/marketplace/buyer/ventures");
    }

    if (id === "messages") {
      navigate("/marketplace/buyer/messages");
    }

    if (id === "wishlist") {
      onNavigate?.("wishlist");
    }

    if (id === "cart") {
      onNavigate?.("cart");
    }

    if (id === "profile") {
      onNavigate?.("profile");
    }

    setMobileNavOpen(false);
  };

  return (
    <>
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close buyer menu"
            onClick={() => setMobileNavOpen(false)}
          />

          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-hidden border-r border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-3">
                <img
                  src="/NEST_logo.png"
                  alt="NEST Logo"
                  className="size-12 object-contain"
                />
                <div>
                  <h1 className="text-lg font-bold text-text">NEST</h1>
                  <p className="text-sm text-muted">Buyer Dashboard</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-border/50"
                aria-label="Close buyer menu"
              >
                <X className="h-5 w-5 text-text" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {drawerItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#efe6d6] font-semibold text-[var(--color-primary)]"
                        : "text-[var(--color-muted)] hover:bg-[#f4ecdd] hover:text-[var(--color-primary)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </div>

                    {item.id === "messages" && totalUnread > 0 && (
                      <span className="rounded-full bg-[#E9C9A8] px-2 py-[2px] text-xs font-semibold text-[#7A3E1D]">
                        {totalUnread > 9 ? "9+" : totalUnread}
                      </span>
                    )}

                    {item.id === "wishlist" && wishlistCount > 0 && (
                      <span className="rounded-full bg-[#E9C9A8] px-2 py-[2px] text-xs font-semibold text-[#7A3E1D]">
                        {wishlistCount}
                      </span>
                    )}

                    {item.id === "cart" && cartCount > 0 && (
                      <span className="rounded-full bg-[#E9C9A8] px-2 py-[2px] text-xs font-semibold text-[#7A3E1D]">
                        {cartCount > 5 ? "5+" : cartCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="border-t border-border p-4 text-left"
              onClick={() => handleNavClick("profile")}
            >
              <div className="flex items-center gap-3 rounded-xl bg-[#efe6d6] p-3">
                <Avatar className="size-10 border border-border">
                  <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary font-semibold text-white">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    {user?.name || "User"}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {user?.email || "Open profile"}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 py-2 lg:px-2 lg:py-0">
          <div className="grid min-h-14 grid-cols-[auto_1fr_auto] items-center gap-2 lg:flex lg:h-16 lg:justify-between lg:gap-3">
            <div
              className="hidden cursor-pointer items-center gap-2 lg:flex"
              onClick={() => onNavigate("marketplace")}
            >
              <div className="flex items-center justify-center rounded-xl">
                <img
                  src="/NEST_logo.png"
                  alt="NEST Logo"
                  className="size-9 object-contain lg:size-10"
                />
              </div>

              <span className="hidden text-lg font-bold text-text lg:inline lg:text-xl">
                NEST
              </span>
            </div>

            <div className="col-start-1 flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="rounded-xl border border-border bg-background p-2 text-text shadow-sm transition hover:border-primary hover:text-primary"
                aria-label="Open buyer menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <div className="hidden min-w-0 items-center justify-center gap-1 sm:gap-2 lg:flex lg:flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => handleNavClick(item.id)}
                    className={`relative h-9 gap-1 rounded-xl px-2 text-[11px] transition-all sm:gap-2 sm:px-3 sm:text-xs lg:h-10 lg:gap-4 lg:px-4 lg:text-sm ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-muted hover:bg-card hover:text-text"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    {item.label}

                    {item.id === "messages" && totalUnread > 0 && (
                      <span className="absolute -right-1 -top-1 rounded-full bg-green-500 px-1 py-0 text-[9px] text-white lg:-right-2 lg:px-1.5 lg:text-xs">
                        {totalUnread > 9 ? "9+" : totalUnread}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>

            <div className="col-start-3 justify-self-end flex items-center gap-1 sm:gap-2 lg:gap-3">
              <img
                src="/NEST_logo.png"
                alt="NEST"
                className="h-10 w-10 shrink-0 rounded-xl border border-border bg-background p-1.5 lg:hidden"
              />

              <Button
                variant="ghost"
                size="icon"
                className="relative hidden rounded-xl transition-all duration-200 hover:bg-card lg:inline-flex"
                onClick={() => onNavigate("wishlist")}
              >
                <Heart
                  className={`h-5 w-5 transition-all duration-300 ${
                    currentPage === "wishlist"
                      ? "fill-primary text-primary"
                      : wishlistCount > 0
                        ? "fill-red-500 text-red-500"
                        : "text-text"
                  }`}
                />

                {wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-primary p-0 text-xs text-white">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative hidden rounded-xl transition-all duration-200 hover:bg-card lg:inline-flex"
                onClick={() => onNavigate("cart")}
              >
                <ShoppingCart className="h-5 w-5 text-text" />

                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-primary px-1 p-0 text-xs text-white">
                    {cartCount > 5 ? "5+" : cartCount}
                  </Badge>
                )}
              </Button>

              <Avatar
                className="hidden size-9 cursor-pointer lg:block lg:size-10"
                onClick={() => onNavigate("profile")}
              >
                <AvatarImage src={user?.avatar} alt={user?.name || "User"} />

                <AvatarFallback className="bg-card font-bold text-text">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
