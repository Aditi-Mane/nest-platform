import {
  Home,
  Lightbulb,
  MessageSquare,
  ShoppingCart,
  Heart,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import api from "../api/axios.js";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useCart } from "../context/CartContext.jsx";
import { useMessages } from "@/context/MessageContext";







export function Navigation({ currentPage, onNavigate, wishlistCount }) {
  const navItems = [
    { id: "marketplace", label: "Home", icon: Home },
    { id: "ventures", label: "Ventures", icon: Lightbulb },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];
  const { totalUnread } = useMessages();
  const { cartItems } = useCart();
  const cartCount = cartItems.length;
  const navigate = useNavigate();
  

  const handleNavClick = (id) => {
  if (id === "messages") {
    navigate("/marketplace/buyer/messages");

  }
  if (id === "marketplace") {
    navigate("/marketplace/buyer/");
  }

  if (id === "ventures") {
    navigate("/marketplace/buyer/ventures");
  }
  };
  const { user, setUser } = useUser();

  useEffect(() => {
    if (!user?.avatar) {
      api.get("/users/me").then(res => {
        setUser(res.data);
      }).catch(err => console.error(err));
    }
  }, []);
 
    
 

 
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 py-2 lg:px-2 lg:py-0">
        <div className="grid min-h-14 grid-cols-[auto_1fr_auto] items-center gap-2 lg:flex lg:h-16 lg:justify-between lg:gap-3">

          {/* Logo */}
          <div
            className="flex cursor-pointer items-center gap-2"
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

          {/* Navigation Links */}
          <div className="flex min-w-0 items-center justify-center gap-1 sm:gap-2 lg:flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative h-9 gap-1 rounded-xl px-2 text-[11px] transition-all sm:gap-2 sm:px-3 sm:text-xs lg:h-10 lg:gap-4 lg:px-4 lg:text-sm
                    ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-muted hover:text-text hover:bg-card"
                    }
                  `}
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

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl transition-all duration-200 hover:bg-card"
              onClick={() => onNavigate("wishlist")}
            >
              <Heart
                className={`h-5 w-5 transition-all duration-300 ${
                  currentPage === "wishlist"
                    ? "text-primary fill-primary"
                    : wishlistCount > 0
                    ? "text-red-500 fill-red-500"
                    : "text-text"
                }`}
              />

              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-xs text-white">
                  {wishlistCount}
                </Badge>
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl transition-all duration-200 hover:bg-card"
              onClick={() => onNavigate("cart")}
            >
              <ShoppingCart className="h-5 w-5 text-text" />

              {cartCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center p-0 bg-primary text-xs text-white"
                >
                  {cartCount > 5 ? "5+" : cartCount}
                </Badge>
              )}
            </Button>

            {/* Profile Avatar */}
            <Avatar
              className="size-9 cursor-pointer lg:size-10"
              onClick={() => onNavigate("profile")}
            >
              <AvatarImage
                src={user?.avatar}
                alt={user?.name || "User"}
              />

              <AvatarFallback className="bg-card text-text font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

          </div>
        </div>

      </div>
    </nav>
  );
}
