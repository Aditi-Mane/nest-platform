import { Heart, ShoppingCart, Star, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function ProductCard({
  id,
  name,
  description,
  category,
  image,
  price,
  condition,
  seller,
  aiMatch,
  isFeatured,
  onViewDetails
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl border-border">
      
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <Button
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          <Heart className="h-4 w-4" />
        </Button>

        {isFeatured && (
          <Badge className="absolute top-3 left-3 bg-[#10B981] gap-1">
            <Star className="h-3 w-3" />
            Featured
          </Badge>
        )}

        {condition && (
          <Badge
            variant="secondary"
            className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm"
          >
            {condition}
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <Badge variant="outline" className="mb-2">
          {category}
        </Badge>

        <h3 className="mb-2 line-clamp-1">{name}</h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>

        {/* Seller */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={seller.avatar} />
            <AvatarFallback>{seller.name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-xs truncate">{seller.name}</p>
          </div>

          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs">{seller.rating}</span>
          </div>
        </div>

        {/* AI Match */}
        {aiMatch && (
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-[#2563EB]/10 to-[#10B981]/10 rounded-lg mb-3">
            <Sparkles className="h-3 w-3 text-[#2563EB]" />
            <span className="text-xs">AI Match: {aiMatch}%</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <p
            className="text-2xl text-[#2563EB]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
          >
            ${price}
          </p>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          variant="outline"
          className="flex-1 rounded-xl"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(id);
          }}
        >
          View Details
        </Button>

        <Button
          className="flex-1 rounded-xl bg-[#2563EB] hover:bg-[#2563EB]/90 gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
