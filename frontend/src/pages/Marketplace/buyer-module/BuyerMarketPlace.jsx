import { useState, useEffect } from "react";
import { SlidersHorizontal, Grid3x3, List } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Buying() {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  //Backend products state
  const [products, setProducts] = useState([]);

  //Loading state
  const [loading, setLoading] = useState(true);

  //Fetch products from backend
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get("http://localhost:5000/api/products");

        // backend should return { products: [...] }
        setProducts(res.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2 font-semi-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover books, notes, and handcrafts from fellow students
          </p>
        </div>

        {/* Filters (still hardcoded UI only) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <Input
              placeholder="Search for books, notes, handcrafts..."
              className="rounded-xl"
            />

            <div className="flex gap-2">
              <Select defaultValue="recent">
                <SelectTrigger className="w-45 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
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
        ) : products.length === 0 ? (
          <p className="text-center text-lg text-gray-500">
            No products available right now.
          </p>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}  
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
