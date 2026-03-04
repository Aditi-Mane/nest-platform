import axios from "axios";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext"; 
import { ImageWithFallback } from "../../../components/figma/ImageWithFallBack.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import api from '../../../api/axios.js'

//Temporary Static data










export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, loading, updateQuantity, removeFromCart } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
  const fetchConversations = async () => {
    try {
      const res = await api.get("conversations/buyer");
      setConversations(res.data.conversations);
    } catch (err) {
      console.error(err);
    }
  };

  fetchConversations();
}, []);

const formattedItems = cartItems
  .filter((item) => item.product !== null)
  .map((item) => {
    const conversation = conversations.find(
      (c) => c.productId?._id === item.product._id
    );

    return {
      id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images?.[0]?.url,
      category: item.product.category,
      description: item.product.description,
      quantity: item.quantity,
      seller: item.product.createdBy,
      productStatus: item.product.status,

      conversationId: conversation?._id,
      status: conversation?.status || null,
    };
});

//handleContactSeller
const handleContactSeller = async (item) => {
  try {
    let conversationId = item.conversationId;

    //If no conversation → create one
    if (!conversationId) {
      const res = await api.post(
        "/conversations/create",
        { productId: item.id },
      );
      const newConversation = res.data.conversation;

      setConversations((prev) => [...prev, newConversation]);

      conversationId = res.data.conversation._id;
    }

    // Navigate to chat
    navigate(`/marketplace/buyer/messages/${conversationId}`);

  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || "Something went wrong");
  }
};
const getStatusBadge = (status) => {
  if (!status) return null;

  switch (status) {
    case "initiated":
      return <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" /> Initiated</Badge>;
    case "negotiating":
      return <Badge className="text-xs bg-yellow-500 text-white"><MessageSquare className="h-3 w-3 mr-1" /> Negotiating</Badge>;
    case "deal_confirmed":
      return <Badge className="text-xs bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" /> Deal Confirmed</Badge>;
    case "cancelled":
      return <Badge className="text-xs bg-red-500 text-white"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
    default:
      return null;
  }
};
const getContactButtonText = (status, productStatus) => {

  if (productStatus === "sold") return "Sold Out";
  if (productStatus === "reserved") return "Currently Reserved";

  
  if (!status) return "Contact Seller";

  switch (status) {
    case "initiated":
      return "Contact Seller";
    case "negotiating":
      return "Continue Negotiation";
    case "deal_confirmed":
      return "Deal Confirmed";
    case "cancelled":
      return "Retry Contact";
    default:
      return "Contact Seller";
  }
};
const getContactButtonVariant = (status) => {
  if (!status) return "outline";

  switch (status) {
    case "deal_confirmed":
      return "secondary";
    default:
      return "outline";
  }
};

// Contact Button Style
        const getButtonStyle = (status, productStatus) => {
          if (productStatus === "sold") {
            return "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
          }

          if (productStatus === "reserved") {
            return "bg-orange-50 text-orange-600 border-orange-100";
          }

          switch (status) {
            case "deal_confirmed":
              return "bg-green-100 text-green-700 border-green-200";
            case "negotiating":
              return "bg-yellow-50 text-yellow-600 border-yellow-100";
            case "cancelled":
              return "bg-red-50 text-red-600 border-red-100";
            default:
              return "bg-green-50 text-green-600 border-green-100";
          }
        };


  const isContactButtonDisabled = (status, productStatus) => {
    return (
    status === "deal_confirmed" ||
    productStatus === "sold" ||
    productStatus === "reserved"
    );
  };
  //for contact button
  const getHoverStyle = (status, productStatus) => {
  if (productStatus === "sold") return "";
  if (productStatus === "reserved") {
    return "hover:!bg-orange-100 hover:!text-orange-700";
  }

  switch (status) {
    case "deal_confirmed":
      return "hover:!bg-green-200 hover:!text-green-800";
    case "negotiating":
      return "hover:!bg-yellow-100 hover:!text-yellow-700";
    case "cancelled":
      return "hover:!bg-red-100 hover:!text-red-700";
    default:
      return "hover:!bg-green-100 hover:!text-green-700";
  }
};

  // Calculate analytics
const totalItems = cartItems.length;
const initiatedCount = formattedItems.filter(i => i.status === 'initiated').length;
const negotiatingCount = formattedItems.filter(i => i.status === 'negotiating').length;
const confirmedCount = formattedItems.filter(i => i.status === 'deal_confirmed').length;
const cancelledCount = formattedItems.filter(i => i.status === 'cancelled').length;
 


  // Price Calculations (UNCHANGED)
  const subtotal = formattedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const platformFee = subtotal * 0.05;
  const total = subtotal + platformFee;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading cart...</p>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-white text-text">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Shopping Cart</h1>
          </div>

          <p className="text-muted">
            {formattedItems.length} item(s) in your cart
          </p>
        </div>

        {formattedItems.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-5">
              {formattedItems.map((item) => (
                <Card
                  key={item.id}
                  className="rounded-2xl border border-border bg-card"
                >
                  <CardContent className="p-6 flex gap-5">
                    {/* Image */}
                  <div
                    className="w-32 h-32 rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between gap-4 mb-2">
                        <div>
                          <h3
                            className="text-lg font-semibold cursor-pointer hover:text-primary"
                            onClick={() => navigate(`/marketplace/buyer/product/${item.id}`)}
                          >
                            {item.name}
                          </h3>

                          <p className="text-sm text-muted mb-2">
                            {item.description}
                          </p>

                          <Badge className="bg-secondary text-white">
                            {item.category}
                          </Badge>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            ₹{item.price}
                          </p>
                          <p className="text-xs text-muted">
                            per item
                          </p>
                        </div>
                      </div>

                      {/* Seller */}
                      <div className="flex items-center gap-2 mb-4">
                       <Avatar className="w-7 h-7">
                        <AvatarImage src={item.seller?.avatar} />
                        <AvatarFallback className="text-xs">
                          {item.seller?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                        <p className="text-sm text-muted">
                          {item.seller?.name} 
                        </p>
                         {getStatusBadge(item.status)}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-2 w-3" />
                          </Button>

                          <span className="w-10 text-center">
                            {item.quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <p className="text-sm">
                          Subtotal:{" "}
                          <span className="font-semibold text-primary">
                            ₹{item.price * item.quantity}
                          </span>
                        </p>

                        <Button
                          variant="ghost"
                          className="ml-auto text-red-600"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                      {/* Contact Seller Button */}
                     <Button
                      size="sm"
                      className={`w-full rounded-xl border 
                        ${getButtonStyle(item.status, item.productStatus)}
                        ${getHoverStyle(item.status, item.productStatus)}
                        !shadow-none transition-all`}
                      onClick={() => handleContactSeller(item)}
                      disabled={isContactButtonDisabled(item.status, item.productStatus)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {getContactButtonText(item.status, item.productStatus)}
                    </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Continue Shopping */}
              <Button
                variant="outline"
                className="w-full rounded-xl border-border"
                onClick={() => navigate("/marketplace")}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </div>

            {/* RIGHT SIDE SUMMARY */}
                <div className="lg:col-span-1 space-y-6">
              {/* Cart Analytics */}
              <Card className="rounded-2xl border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-[#2563EB]" />
                    <h3 className="text-xl font-semibold">Cart Analytics</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Total Items */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#2563EB]/10 to-[#2563EB]/5">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="h-4 w-4 text-[#2563EB]" />
                        <span className="text-xs text-muted-foreground">Total Items</span>
                      </div>
                      <div className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                        {totalItems}
                      </div>
                    </div>

                    {/* Conversations Initiated */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Initiated</span>
                      </div>
                      <div className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                        {initiatedCount}
                      </div>
                    </div>

                    {/* Negotiating */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">Negotiating</span>
                      </div>
                      <div className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                        {negotiatingCount}
                      </div>
                    </div>

                    {/* Confirmed */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-[#10B981]" />
                        <span className="text-xs text-muted-foreground">Confirmed</span>
                      </div>
                      <div className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                        {confirmedCount}
                      </div>
                    </div>
                  </div>

                  

                  {/* Cancelled Items */}
                  {cancelledCount > 0 && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-700">Cancelled Items</span>
                        </div>
                        <span className="text-lg font-semibold text-red-600">{cancelledCount}</span>
                      </div>
                      <p className="text-xs text-red-600 mt-2">
                        Consider retrying or removing these items
                      </p>
                    </div>
                  )}

                  {/* Order Summary - Compact Version */}
                  <div className="mt-6 pt-6 border-t">
                   
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cart Total</span>
                        <span className="text-lg  text-primary" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                         ₹{subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Items */}
              <Card className="rounded-2xl border-border shadow-sm">
                <CardContent className="p-6">
                  <h4 className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#10B981]" />
                    You might also like
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                      <div 
                        className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=200)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2 mb-1">Watercolor Cards Set</p>
                        <p className="text-sm text-[#2563EB]">$18</p>
                      </div>
                    </div>
                    <div className="flex gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                      <div 
                        className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2 mb-1">Calculus Study Guide</p>
                        <p className="text-sm text-[#2563EB]">$22</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
          {/* Cart icon inside circle like Wishlist */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-500 text-3xl">
            🛒
          </div>
          <p className="text-2xl font-semibold text-text">Your cart is empty</p>
          <p className="text-sm text-muted text-center">
            Looks like you haven’t added anything yet.
          </p>
          <Button
            variant="ghost"
            className="mt-2 text-primary text-lg hover:bg-transparent hover:underline"
            onClick={() => navigate("/marketplace/buyer")}
          >
            Explore the marketplace →
          </Button>
        </div>
        )}
      </div>
    </div>
  );
} 