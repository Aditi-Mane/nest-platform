import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useOutletContext } from "react-router-dom";

export default function Wishlist() {
  const navigate = useNavigate();

  const { favourites, products, toggleFavourite } = useOutletContext();
  console.log("Products:", products);
  console.log("Favourites:", favourites);
  
  const wishlistProducts = products.filter((product) =>
    favourites.includes(product._id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-7 w-7 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-semibold">My Wishlist</h1>
        </div>

        {/* Empty State */}
        {wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <Heart className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-medium mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Start adding items you love ❤️
            </p>

            <button
              onClick={() => navigate("/marketplace/buyer")}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isFavourite={true}
                onToggleFavourite={() => onToggleFavourite(product._id)}
                onViewDetails={() =>
                  navigate(`/marketplace/buyer/product/${product._id}`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}