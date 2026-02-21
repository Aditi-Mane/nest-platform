import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext"; 
import { ImageWithFallback } from "../../../components/figma/ImageWithFallBack.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, loading, updateQuantity, removeFromCart } = useCart();

  const [promoCode, setPromoCode] = useState("");

  // Format items to match your existing UI structure
  const formattedItems = cartItems.map((item) => ({
    id: item.product._id,
    name: item.product.name,
    price: item.product.price,
    image: item.product.images?.[0]?.url,
    category: item.product.category,
    quantity: item.quantity,
    seller: item.product.createdBy,
    description: item.product.description,
  }));

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
                            onClick={() => navigate(`/product/${item.id}`)}
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
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
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
                            <Minus className="h-4 w-4" />
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
            <div>
              <Card className="rounded-2xl sticky top-24 bg-card border border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6">
                    Order Summary
                  </h3>

                  <div className="mb-6">
                    <label className="text-sm block mb-2">
                      Promo Code
                    </label>

                    <div className="flex gap-2">
                      <Input
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value)
                        }
                        placeholder="Enter code"
                        className="rounded-xl"
                      />
                      <Button variant="outline">
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Platform Fee (5%)</span>
                      <span>₹{platformFee.toFixed(2)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full rounded-xl bg-primary hover:opacity-90"
                    onClick={() => navigate("/checkout")}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl mt-6 bg-card border border-border">
                <CardContent className="p-6">
                  <h4 className="flex items-center gap-2 font-semibold mb-4">
                    <Sparkles className="h-5 w-5 text-secondary" />
                    You might also like
                  </h4>

                  <p className="text-sm text-muted">
                    Recommendations coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-2xl font-semibold text-text">
              Your cart is empty 🛒
            </p>

            <p className="text-sm text-muted mt-2">
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