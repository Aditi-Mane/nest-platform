import {
  Home,
  Lightbulb,
  MessageSquare,
  ShoppingCart,
  Heart,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useCart } from "../context/CartContext.jsx";

export function Navigation({ currentPage, onNavigate, wishlistCount }) {
  const navItems = [
    { id: "marketplace", label: "Home", icon: Home },
    { id: "ventures", label: "Ventures", icon: Lightbulb },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];
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
  const { user } = useUser();


  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-2 py-0">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate("marketplace")}
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <span className="text-white text-xl font-bold">N</span>
            </div>

            <span className="text-xl font-semibold text-text">
              NEST
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => handleNavClick(item.id)}
                  className={`gap-4 rounded-xl px-4 transition-all
                    ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-muted hover:text-text hover:bg-card"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl hover:bg-card transition-all duration-200"
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
              className="relative rounded-xl hover:bg-card transition-all duration-200"
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
              className="cursor-pointer border border-border"
              onClick={() => onNavigate("profile")}
            >
              <AvatarImage
                src={
                  user?.avatar
                    ? `http://localhost:5000${user.avatar}`
                    : undefined
                }
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