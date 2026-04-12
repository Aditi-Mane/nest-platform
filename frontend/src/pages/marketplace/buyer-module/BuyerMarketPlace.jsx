import { Search, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  SlidersHorizontal,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

import toast from "react-hot-toast";
import { ProductCard } from "@/components/ProductCard.jsx";
import { CategoryFilter } from "@/components/CategoryFilter.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { useNavigate, useOutletContext } from "react-router-dom";

import api from "../../../api/axios.js"; 

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import axios from "axios";
import {useCart} from "../../../context/CartContext.jsx";
import { useUser } from "../../../context/UserContext.jsx";

export default function Buying() {
  const navigate = useNavigate();
  const { user } = useUser();

  const { favourites, toggleFavourite } = useOutletContext();

  const {addToCart} =useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("recent");
      
 useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/products", {
        params: {
          page,
          limit: 9,
          search: searchQuery,
          category: selectedCategory,
          sort: sortBy,
        },
      });

      setProduct(res.data.products);
      setTotalPages(res.data.totalPages);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [page, searchQuery, selectedCategory, sortBy]);

useEffect(() => {
  setPage(1);
}, [searchQuery, selectedCategory, sortBy]);


 
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Marketplace</h1>
            </div>
            <p className="text-muted-foreground">
              Discover books, notes, and handcrafts from fellow students
            </p>
          </div>

          {user?.availableRoles?.includes("admin") && (
            <Button
              onClick={() => navigate("/admin")}
              variant="outline"
              className="rounded-full border-border bg-card text-text hover:bg-background"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Button>
          )}
        </div>
        <div className="relative mb-8 overflow-hidden rounded-[28px] border border-border bg-card p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24" />

          <div className="relative mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">

            {/* Search */}
            <div className="group relative w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors duration-200 group-hover:text-primary" />

              <Input
                placeholder="Search books, notes, electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 rounded-2xl border border-border bg-background/80 pl-11 pr-12 text-sm shadow-sm transition-all duration-200 hover:border-primary/35 hover:bg-card focus-visible:border-primary/45 focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/10"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-all duration-200 hover:bg-background hover:text-text"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3 lg:ml-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 w-[190px] rounded-2xl border-border bg-background/80 px-4 text-sm shadow-sm data-[size=default]:h-12 transition-all duration-200 hover:border-primary/35 hover:bg-card focus-visible:border-primary/45 focus-visible:ring-4 focus-visible:ring-primary/10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>

                <SelectContent className="rounded-2xl border border-border bg-card shadow-xl">
                  <SelectItem
                    value="recent"
                    className="rounded-xl px-3 py-2 text-text focus:bg-background focus:text-primary"
                  >
                    Most Recent
                  </SelectItem>
                  <SelectItem
                    value="popular"
                    className="rounded-xl px-3 py-2 text-text focus:bg-background focus:text-primary"
                  >
                    Most Popular
                  </SelectItem>
                  <SelectItem
                    value="price-low"
                    className="rounded-xl px-3 py-2 text-text focus:bg-background focus:text-primary"
                  >
                    Price: Low to High
                  </SelectItem>
                  <SelectItem
                    value="price-high"
                    className="rounded-xl px-3 py-2 text-text focus:bg-background focus:text-primary"
                  >
                    Price: High to Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category + Filters */}
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            
          </div>
        </div>
        {/*Products Section */}
        {loading ? (
          <p className="text-center text-lg">Loading products...</p>
        ) : product.length === 0 ? (
          <p className="text-center text-lg text-gray-500">
            No products available right now.
          </p>
        ) : (
          <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {product.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isFavourite={favourites.includes(product._id)}
                onToggleFavourite={() => toggleFavourite(product._id)}
                onViewDetails={() =>
                  navigate(`/marketplace/buyer/product/${product._id}`)
                }
                onAddToCart={addToCart}
              />
            ))}
            
        </div>

        <div className="flex justify-center items-center gap-3 mt-10">
          <Button
            className="border-border text-text"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>

          <span className="text-sm text-text">
            Page {page} of {totalPages}
          </span>

          <Button
          className="border-border text-text"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
          </div>
        
        </>
          

          
        )}


       
      </div>
    </div>
  );
}
