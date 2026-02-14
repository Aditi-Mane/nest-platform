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
import {useEffect, useState} from "react";
import axios from "axios";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const[product, setProduct]=useState(null);
  const isSold= product?.status=== "sold";

  //fetch product details from backend
  useEffect(()=>{
    async function fetchProduct(){
      try{
        const res=await axios.get(
        `http://localhost:5000/api/products/${id}`);
        setProduct(res.data.product);
      }catch(err){
        console.log("Error fetching product:", err);

      }
    }
    fetchProduct();
  },[id]);

  //format createdAt(Posted)
  const postedDate=product?.createdAt?
  new Date(product.createdAt).toLocaleDateString("en-IN",{
      day: "numeric",
      month: "short",
      year: "numeric" 
  }):"Recently";

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

if (!product) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}
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
                  src={product.images?.[0]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="secondary">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-4 flex gap-2 overflow-x-auto">
                {product.images.map((imgObj, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-lg overflow-hidden border cursor-pointer"
                  >
                    <ImageWithFallback
                      src={imgObj.url}
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
                <h1 className="text-3xl mb-2 font-bold">{product.name}</h1>

                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary">{product.category}</Badge>
                  <Badge variant="outline">{product.condition}</Badge>
                </div>

                <p className="text-4xl text-[#2563EB] mb-4">
                  ₹{product.price}
                </p>

                <div className="flex gap-3 mb-4">
  
                {/* Stock */}
                <Badge variant="outline">
                  Stock: {product?.stock ?? 0}
                </Badge>

                {/* Status */}
                <Badge
                  variant="secondary"
                  className={
                    product?.status === "sold"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }
                >
                  {product?.status?.toUpperCase() ?? "available"}
                </Badge>
              </div>

                <p className="text-muted-foreground mb-6 font-medium">
                  {product.description}
                </p>

                <Separator className="my-6" />

              <h3 className="mb-3 font-semibold">What's Included</h3>
               

                {/*What's Included*/}
                <div className="grid md:grid-cols-2 gap-2">
                  {product.whatsIncluded?.length > 0 ? (
                    product.whatsIncluded.map((f, i) => (
                      <div key={i} className="flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                        <span className="text-sm">{f}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No extra details provided.
                    </p>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Package className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-medium">Condition</p>
                    <p className="text-sm">{product.condition}</p>
                  </div>
                  <div>
                    <MapPin className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-medium">Location</p>
                    <p className="text-sm">{product.location}</p>
                  </div>
                  <div>
                    <Shield className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-medium">Posted</p>
                    <p className="text-sm">{postedDate}</p>
                  </div>
                </div>

              </CardContent>
            </Card>
            {/* Reviews
            <Card className="rounded-2xl bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Reviews</span>
                  <span className="text-sm text-muted">
                    ⭐ {product.seller.rating} ({product?.seller?.reviews})
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {reviews.map((review, i) => (
                  <div key={i}>
                    {i > 0 && <Separator className="mb-6" />}

                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.avatar} />
                        <AvatarFallback>{review.author[0]}</AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-semibold">{review.author}</p>
                        <p className="text-sm text-muted">{review.date}</p>
                        <p className="text-sm text-muted mt-2">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card> */}
          </div> 

          {/* Sidebar
          <div className="space-y-6">
            <Card className="rounded-2xl  top-24">
              <CardContent className="p-6 space-y-4">
                <Button  disabled={isSold}  className="w-full rounded-xl gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  {isSold ? "Sold Out" : "Add to Cart"}
                </Button>

                <Button disabled={isSold} variant="outline" className="w-full rounded-xl">
                  {isSold ? "Unavailable" : "Buy Now"}
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
                    <AvatarImage src={product?.seller?.avatar} />
                    <AvatarFallback>
                      {product?.seller?.name?? "Seller"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{product.seller.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product?.seller?.university ?? "SPPU"}
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
          </div> */}
        </div>
      </div>
    </div>
  );
}
