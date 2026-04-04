import { useState } from "react";
import { ShoppingCart, Heart, Star, ChevronDown } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import api from "../api/axios";
import { toast } from "sonner";

export function ProductCard({ 
  product, 
  onViewDetails, 
  isFavourite, 
  onToggleFavourite,
  onAddToCart 
}) {

  // If no product passed, don't render anything
  if (!product) return null;

  // Product unavailable if not "available"
  const isUnavailable = product.status !== "available";

  // Image carousel index
  const [imageIndex, setImageIndex] = useState(0);

  // Collapse state for "What's included"
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl border-border">

      {/* ===================== IMAGE SECTION ===================== */}
      <div className="relative h-56 overflow-hidden bg-gray-100 flex items-center justify-center">

        {/* Show product images */}
        {product.images && product.images.length > 0 ? (
          <>
            {/* Current Image */}
            <img
              src={product.images[imageIndex].url}
              alt={product.name}
              className="h-full w-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            />

            {/* Image Dots for switching images */}
            {product.images.length > 1 && (
              <div className="absolute bottom-2 w-full flex justify-center gap-1">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation(); // prevent card click
                      setImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full ${
                      imageIndex === index
                        ? "bg-white"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-400">No Image</span>
        )}

        {/* Favourite Button (Heart Icon) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavourite();
            toast.success("❤️ Product added to wishlist!");
          }}
          className="absolute top-3 right-3 transition-transform hover:scale-110"
          disabled={isUnavailable}
        >
          <Heart
            className={`h-6 w-6 ${
              isFavourite
                ? "fill-red-500 text-red-500"
                : "text-rose-600"
            }`}
          />
        </button>

        {/* Product Condition Badge (New / Used) */}
        {product.condition && (
          <Badge className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm">
            {product.condition}
          </Badge>
        )}

        {/* Product Status Badge (Sold / Reserved) */}
        {product.status !== "available" && (
          <Badge className="absolute top-3 left-3 bg-gray-800 text-white">
            {product.status.toUpperCase()}
          </Badge>
        )}
      </div>

      {/* ===================== PRODUCT CONTENT ===================== */}
      <CardContent className="p-4">

        {/* Category Badge */}
        <Badge className="bg-gray-200 text-gray-800">
          {product.category}
        </Badge>

        {/* Product Name */}
        <h3 className="mb-2 line-clamp-1 font-bold text-lg">
          {product.name}
        </h3>

        {/* Seller Information */}
        {product.createdBy && (
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={product.createdBy.avatar || ""} />
              <AvatarFallback>
                {product.createdBy.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            <p className="text-xs text-muted-foreground truncate">
              {product.createdBy.name}
            </p>
          </div>
        )}

        {/* Description + Collapsible "What's Included" */}
        <div className="text-sm text-muted-foreground mb-2">
          <div className="flex justify-between items-start gap-2">

            {/* Product Description */}
            <p className="line-clamp-2">{product.description}</p>

            {/* Expand Button */}
            {product.whatsIncluded?.length > 0 && (
              <button onClick={() => setExpanded(!expanded)}>
                <ChevronDown
                  className={`transition-transform ${
                    expanded ? "rotate-180" : ""
                  }`}
                  size={18}
                />
              </button>
            )}
          </div>

          {/* Collapsible Included Items */}
          {expanded && (
            <ul className="mt-2 text-sm space-y-1">
              <p className="font-medium">What's included:</p>
              {product.whatsIncluded.map((item, i) => (
                <li key={i}>✓ {item}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Product Rating */}
        <div className="flex items-center gap-1 text-sm mb-2">
          <Star className="h-4 w-4 fill-primary text-primary" />

          {product.reviewCount > 0 ? (
            <span className="text-muted-foreground">
              {product.averageRating.toFixed(1)} ({product.reviewCount})
            </span>
          ) : (
            <span className="text-muted-foreground opacity-70">
              No reviews yet
            </span>
          )}
        </div>

        {/* Product Price */}
        <div className="flex items-center justify-between">
          <p className="text-2xl font-semibold text-primary">
            ₹{product.price}
          </p>
        </div>
      </CardContent>

      {/* ===================== FOOTER BUTTONS ===================== */}
      <CardFooter className="p-4 pt-0 gap-2">

        {/* View Details Button */}
        <Button
          variant="outline"
          className="flex-1 rounded-xl border-primary text-primary hover:bg-primary/10"
          onClick={async (e) => {
            e.stopPropagation();
            try {
              await api.patch(`/seller/views/${product._id}`);
            } catch (err) {
              console.error("Error updating views", err);
            }
            onViewDetails(product._id);
          }}
        >
          View Details
        </Button>

        {/* Add to Cart Button */}
        <Button
          disabled={isUnavailable}
          className={`flex-1 rounded-xl gap-2 ${
            isUnavailable
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isUnavailable) {
              onAddToCart(product._id);
            }
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.status === "sold"
            ? "Sold Out"
            : product.status === "reserved"
            ? "Reserved"
            : "Add to Cart"}
        </Button>

      </CardFooter>
    </Card>
  );
}
