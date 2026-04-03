import { Search, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  SlidersHorizontal,
  Grid3x3,
  List,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

import { toast } from "sonner";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import axios from "axios";
import {useCart} from "../../../context/CartContext.jsx";
import { useUser } from "../../../context/UserContext.jsx";

export default function Buying() {
  const navigate = useNavigate();
  const { user } = useUser();

  
  const [viewMode, setViewMode] = useState("grid");

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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">

          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">

            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

              <Input
                placeholder="Search books, notes, electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort + Grid/List */}
            <div className="flex items-center gap-3 lg:ml-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] rounded-xl border-gray-300">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>

                <SelectContent className="bg-white border rounded-lg shadow-md">
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="grid" >
                    <Grid3x3 className="h-4 w-4" />
                  </TabsTrigger>

                  <TabsTrigger value="list" >
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Category + Filters */}
          <div className="flex justify-between items-center">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <Button
              variant="outline"
              className="rounded-xl flex items-center gap-2 border-gray-300 hover:bg-gray-100"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
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
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
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
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>

          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <Button
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
