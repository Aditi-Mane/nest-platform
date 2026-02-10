import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ShoppingCart,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Package,
  Shield
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Separator } from "@/components/ui/separator";
import { useParams, useNavigate } from "react-router-dom";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const product = {
    name: "Organic Chemistry Notes - Complete Set",
    description:
      "Comprehensive handwritten notes covering all Organic Chemistry 1 & 2 topics with detailed diagrams, reaction mechanisms, and practice problems.",
    category: "Study Notes",
    price: 25,
    condition: "Like New",
    image:
      "https://images.unsplash.com/photo-1724166595400-fdfcdb29685e?w=800",
    images: [
      "https://images.unsplash.com/photo-1724166595400-fdfcdb29685e?w=800",
      "https://images.unsplash.com/photo-1622490836804-4069f1f6df53?w=800",
      "https://images.unsplash.com/photo-1724166595400-fdfcdb29685e?w=800"
    ],
    seller: {
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      university: "MIT",
      major: "Chemistry",
      year: "Senior",
      rating: 4.9,
      reviews: 28,
      itemsSold: 45,
      responseTime: "< 1 hour"
    },
    aiMatch: 95,
    stock: 1,
    location: "Cambridge, MA",
    posted: "2 days ago"
  };

  const features = [
    "Complete notes for Orgo 1 & 2",
    "150+ pages of detailed content",
    "Hand-drawn reaction mechanisms",
    "Practice problems with solutions",
    "Organized by topic and chapter",
    "Color-coded for easy reference"
  ];

  const similarItems = [
    {
      name: "General Chemistry Notes",
      price: 20,
      image:
        "https://images.unsplash.com/photo-1724166595400-fdfcdb29685e?w=200"
    },
    {
      name: "Biochemistry Study Guide",
      price: 22,
      image:
        "https://images.unsplash.com/photo-1622490836804-4069f1f6df53?w=200"
    },
    {
      name: "Chemistry Lab Manual",
      price: 18,
      image:
        "https://images.unsplash.com/photo-1724166595400-fdfcdb29685e?w=200"
    }
  ];

  const reviews = [
    {
      author: "Michael Brown",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      rating: 5,
      date: "1 week ago",
      comment:
        "These notes are amazing! Helped me ace my Orgo exam. Very detailed and well-organized."
    },
    {
      author: "Emma Wilson",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Clear handwriting, great diagrams. Worth every penny!"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card className="rounded-2xl overflow-hidden">
              <div className="relative h-96">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="secondary">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="secondary">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-4 flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-lg overflow-hidden border cursor-pointer"
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Details */}
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <h1 className="text-3xl mb-2">{product.name}</h1>

                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary">{product.category}</Badge>
                  <Badge variant="outline">{product.condition}</Badge>
                </div>

                <p className="text-4xl text-[#2563EB] mb-4">
                  ${product.price}
                </p>

                <p className="text-muted-foreground mb-6">
                  {product.description}
                </p>

                <Separator className="my-6" />

                <h3 className="mb-3">What's Included</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {features.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-2xl sticky top-24">
              <CardContent className="p-6 space-y-4">
                <Button className="w-full rounded-xl gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>

                <Button variant="outline" className="w-full rounded-xl">
                  Buy Now
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={product.seller.avatar} />
                    <AvatarFallback>
                      {product.seller.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{product.seller.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.seller.university}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => navigate("/messages")}
                >
                  <MessageSquare className="h-4 w-4" />
                  Message Seller
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
