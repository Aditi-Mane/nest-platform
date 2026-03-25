
import { useState, useEffect, useMemo } from "react";
import { SlidersHorizontal, Grid3x3, List, ShoppingBag } from "lucide-react";

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

export default function Buying() {
  const navigate = useNavigate();

  
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
        <div className="mb-8">
         <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Marketplace</h1>
          </div>
          <p className="text-muted-foreground">
            Discover books, notes, and handcrafts from fellow students
          </p>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <Input
          placeholder="Search for books, notes, handcrafts..."
          value={searchQuery}
          onChange={(e)=> setSearchQuery(e.target.value)}
          className="rounded-xl border border-border 
                    focus:border-secondary 
                    focus:outline-none 
                    focus-visible:ring-2 
                    focus-visible:ring-secondary"
          />

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-45 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-muted">
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList>
                  <TabsTrigger value="grid">
                    <Grid3x3 className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <Button variant="outline" className="gap-2 rounded-xl">
              <SlidersHorizontal className="h-4 w-4" />
              More Filters
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
