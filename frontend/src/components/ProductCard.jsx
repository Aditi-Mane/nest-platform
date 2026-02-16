import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"; 

export function ProductCard({ product, onViewDetails }) {
  if (!product) return null;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl border-border">

      {/* Image */}
      <div className="relative h-60 overflow-hidden">
        <ImageWithFallback
          src={product.images?.[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Condition Badge */}
        {product.condition && (
          <Badge
            variant="secondary"
            className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm"
          >
            {product.condition}
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {/* Category */}
        <Badge variant="outline" className="mb-2">
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
          className="flex-1 rounded-xl bg-primary text-white hover:bg-primary/90 gap-2"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Added to cart:", product._id);
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
