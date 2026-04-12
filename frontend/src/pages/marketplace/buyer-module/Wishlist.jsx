import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const navigate = useNavigate();
  const { favourites, products, toggleFavourite } = useOutletContext();
  
  const wishlistProducts = products.filter((product) =>
    favourites.includes(product._id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-bold">My Wishlist</h1>
          </div>

          <p className="text-muted">
            {wishlistProducts.length} item(s) in your wishlist
          </p>
        </div>

        {/* Empty State or Grid */}
        {wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-500 text-3xl">
              ❤️
            </div>

            <p className="text-2xl font-semibold text-text">Your wishlist is empty</p>
            <p className="text-sm text-muted text-center">
              Looks like you haven’t added anything to your wishlist yet.
            </p>

            <Button
              variant="ghost"
              className="mt-2 text-primary text-lg hover:bg-transparent hover:underline"
              onClick={() => navigate("/marketplace/buyer")}
            >
              Explore the marketplace →
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isFavourite={true}
                onToggleFavourite={() => toggleFavourite(product._id)}
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