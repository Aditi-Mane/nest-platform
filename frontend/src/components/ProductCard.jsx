import { ShoppingCart, Heart } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

import { ImageWithFallback } from "./figma/ImageWithFallBack";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

 
    export function ProductCard({ 
      product, 
      onViewDetails, 
      isFavourite, 
      onToggleFavourite,
      onAddToCart 
    }) {
  if (!product) return null;
  const isUnavailable = product.status !== "available";
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl border-border">

      {/* Image */}
      <div className="relative h-60 overflow-hidden">
        <ImageWithFallback
          src={product.images?.[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Favourite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavourite();
          }}
          className="absolute top-3 right-3 transition-transform hover:scale-110"
        >
          <Heart
            className={`h-6 w-6 transition-all duration-300 ${
              isFavourite
                ? "fill-red-500 text-red-500"
                : "text-rose-600"
            }`}
          />
        </button>
    
        {/* Condition Badge */}
        {product.condition && (
          <Badge
            className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm"
          >
            {product.condition}
          </Badge>
        )}

        {/* Status Badge */}
        {product.status !== "available" && (
          <Badge
            className={`absolute top-3 right-3
              ${
                product?.status === "sold"
                  ? "bg-linear-to-r from-red-500 to-rose-600 text-white shadow-sm"
                  : "bg-linear-to-r from-amber-400 to-orange-500 text-white shadow-sm"
              }
            `}
          >
            {product?.status?.toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {/* Category */}
        <Badge className="bg-secondary text-white">
          {product.category}
        </Badge>

        {/* Name */}
        <h3 className="mb-2 line-clamp-1 font-bold text-lg">
          {product.name}
        </h3>

        {/* Seller Info */}
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

        {/* Description */}
        <p className="text-sm font-medium text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Rating (Sentiment Rating from backend) */}
        {product.sentimentRating && (
          <p className="text-xs text-muted-foreground mb-2">
            ⭐ {product.sentimentRating} ({product.ratingCount} reviews)
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <p className="text-2xl font-semibold text-primary">
            ₹{product.price}
          </p>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0 gap-2">
        {/* View Details */}
        <Button
          variant="outline"
          className="flex-1 rounded-xl border-primary text-primary hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product._id);
          }}
        >
          View Details
        </Button>

        {/* Add to Cart */}
      <Button
        disabled={isUnavailable}
        className={`flex-1 rounded-xl gap-2
          ${
            isUnavailable
              ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70 pointer-events-none"
              : "bg-primary text-white hover:bg-primary/90"
          }
        `}
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
