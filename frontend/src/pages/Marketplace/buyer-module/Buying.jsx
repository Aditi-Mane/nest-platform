import { useState } from "react";
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

export default function Buying() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const allProducts = [
    {
      id: "1",
      name: "Organic Chemistry Notes - Complete Set",
      description: "Comprehensive handwritten notes covering all Organic Chemistry 1 & 2 topics",
      category: "Study Notes",
      image: "https://images.unsplash.com/photo-1724166595400-fdfcdb29685e?w=600",
      price: 25,
      condition: "Like New",
      seller: {
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        university: "MIT",
        rating: 4.9
      },
      aiMatch: 92,
      isFeatured: true
    },
    {
      id: "2",
      name: "Hand-woven Macrame Wall Hanging",
      description: "Beautiful bohemian-style wall art, perfect for dorm room decoration",
      category: "Handcrafts",
      image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600",
      price: 35,
      condition: "New",
      seller: {
        name: "Marcus Johnson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        university: "Stanford",
        rating: 4.8
      },
      aiMatch: 88,
      isFeatured: true
    },
    {
      id: "3",
      name: "Data Structures Textbook + Notes",
      description: "Complete CS textbook with color-coded notes and practice problems",
      category: "Books",
      image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=600",
      price: 45,
      condition: "Very Good",
      seller: {
        name: "Emily Rodriguez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
        university: "UCLA",
        rating: 5.0
      },
      aiMatch: 95
    },
    // ⬇️ keep rest of products same (no change)
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover books, notes, and handcrafts from fellow students
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <Input
              placeholder="Search for books, notes, handcrafts..."
              className="rounded-xl"
            />

            <div className="flex gap-2">
              <Select defaultValue="recent">
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="match">AI Match Score</SelectItem>
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

        {/* Products */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {allProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onViewDetails={(id) => navigate(`/marketplace/buyer/product/${id}`)}
            />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" className="rounded-full px-8">
            Load More Items
          </Button>
        </div>
      </div>
    </div>
  );
}
