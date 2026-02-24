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
import api from "../../../api/axios.js";
import { useCart } from "../../../context/CartContext.jsx";

export default function ProductDetailPage() {
  const { addToCart } = useCart();
  const { id } = useParams();
  const navigate = useNavigate(); 
  const[product, setProduct]=useState(null);
  const isUnavailable = product?.status !== "available";
  const seller = product?.createdBy;
  console.log(seller);

  const [reviews, setReviews] =useState([]);
  const [loadingReviews, setLoadingReviews] =useState(true);

  //selected photo
  const [selectedImage, setSelectedImage] = useState(null);

  //fetch product details from backend
  useEffect(()=>{
    async function fetchProduct(){
      try{
        const res=await api.get(
        `/products/${id}`);
        setProduct(res.data.product);

        //set image default -> the first one
        if (res.data.product.images?.length > 0) {
           setSelectedImage(res.data.product.images[0].url);
        }
      }catch(err){
        console.log("Error fetching product:", err);

      }
     
    }
    async function fetchReviews(){
        try{
          const res=await api.get(
              `/reviews/product/${id}`
          );
          setReviews(res.data.reviews);
        }catch(err){
           console.log("Error fetching reviews:", err);
        } finally {
           setLoadingReviews(false);
        }
      }
    fetchProduct();
    fetchReviews();
    

  },[id]);

  //format createdAt(Posted)
  const postedDate=product?.createdAt?
  new Date(product.createdAt).toLocaleDateString("en-IN",{
      day: "numeric",
      month: "short",
      year: "numeric" 
  }):"Recently";


  // handle add to cart
  const handleAddToCart = async () => {
  try {
    await addToCart(product._id);
    navigate("/marketplace/buyer/cart");
  } catch (error) {
    console.log(error);
  }
};
  const handleBuyNow = async () => {
  try {
    await addToCart(product._id);
    navigate("/marketplace/buyer/checkout");
  } catch (error) {
    console.log(error);
  }
};

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

 

if (!product) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}
  return (
    <div className="min-h-screen bg-gray-10">
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
            <Card className="rounded-2xl overflow-hidden border-border shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="h-96 w-full bg-backgroud rounded-xl overflow-hidden flex items-center justify-center py-3">
                
                <ImageWithFallback
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain transition-opacity duration-300"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="secondary">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-4 flex gap-2 overflow-x-auto">
                {product.images?.map((imgObj, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(imgObj.url)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border cursor-pointer 
                      ${selectedImage === imgObj.url ? "border-primary" : ""}
                    `}
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
                 <Badge className="bg-secondary text-white">
                {product.category}
                </Badge>
                  <Badge variant="outline">{product.condition}</Badge>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-4xl text-primary mb-4 font-bold tracking-tight">
                  ₹{product.price}
                </p>
                </div>

                <div className="flex gap-3 mb-4">
  
                {/* Stock */}
                <Badge variant="outline">
                  Stock: {product?.stock ?? 0}
                </Badge>

                {/* Status */}
               <Badge
                className={
                  product?.status === "sold"
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm"
                    : product?.status === "reserved"
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm"
                    : "bg-gradient-to-r from-emerald-400 to-green-600 text-white shadow-sm"
                }
              >
                {product?.status?.toUpperCase() ?? "AVAILABLE"}
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
           {/* Reviews Section */}
<Card className="rounded-2xl bg-card/80 backdrop-blur-sm border-border shadow-sm">
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <span>Reviews</span>

      <span className="text-sm text-muted-foreground">
        {reviews.length} Reviews
      </span>
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-6">
    {/* Loading */}
    {loadingReviews && (
      <p className="text-sm text-muted-foreground">
        Loading reviews...
      </p>
    )}

    {/* No Reviews */}
    {!loadingReviews && reviews.length === 0 && (
      <p className="text-sm text-muted-foreground">
        No reviews yet. Be the first to review this product!
      </p>
       )}

           {/* Reviews List */}
            {!loadingReviews &&
                reviews.map((review, i) => (
                  <div key={review._id}>
                    {i > 0 && <Separator className="mb-6" />}

                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user?.avatar || ""} />
                        <AvatarFallback>
                          {review.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>

                      {/* Review Content */}
                      <div className="flex-1">
                        {/* Name + Stars */}
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">
                            {review.user?.name || "Anonymous"}
                          </p>

                          {/* Star Rating */}
                          <div className="flex items-center gap-1 text-yellow-500">
                           
                            {Array.from({ length: review.starRating || 0 }).map((_, index) => (
                              <Star
                                key={index}
                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                         
                          </div>
                        </div>

                        {/* Date */}
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>

                        {/* Review Text */}
                        <p className="text-sm text-muted-foreground mt-2">
                          {review.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
          </div>
        
            {/* Sidebar */}
          <div className="space-y-6">
                   {/* Purchase Card */}
            <Card className="rounded-2xl top-24  self-start">
              <CardContent className="p-6 space-y-4">
          <Button
                    className={`w-full rounded-xl gap-2 transition-all duration-300
                      ${
                        isUnavailable
                          ? "bg-muted text-background cursor-not-allowed"
                          : "bg-secondary text-background hover:bg-secondary focus:bg-secondary active:bg-secondary shadow-sm hover:shadow-md hover:-translate-y-0.5"
                      }
                    `}
                    size="lg"
                    disabled={isUnavailable}
                    onClick={handleAddToCart}
                  >
                  <ShoppingCart className="h-5 w-5" />
                  {product?.status === "sold"
                    ? "Sold Out"
                    : product?.status === "reserved"
                    ? "Reserved"
                    : "Add to Cart"}
                </Button>

                <Button
                    className={`w-full rounded-xl transition-all duration-300 shadow-md
                      ${
                        isUnavailable
                          ? "bg-muted text-background cursor-not-allowed"
                          : "bg-primary text-background hover:brightness-95 hover:shadow-lg hover:-translate-y-1"
                      }
                    `}
                    size="lg"
                    disabled={isUnavailable}
                    onClick={handleBuyNow}
                  >
                  {product?.status === "sold"
                    ? "Unavailable"
                    : product?.status === "reserved"
                    ? "Currently Reserved"
                    : "Buy Now"}
                </Button>
                <Separator />

                <div className="text-center text-sm text-muted-foreground">
                  <Shield className="h-5 w-5 mx-auto mb-2" />
                  <p>Secure payment through Nest</p>
                  <p>Money-back guarantee</p>
                </div>
              </CardContent>
            </Card>

            {/* Seller Card */}
           
            {seller && (
              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle>Seller Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={seller.avatar} />
                      <AvatarFallback>{seller.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="mb-1">{seller.name}</h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        {seller?.collegeName ?? "N/A"}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">
                          {seller.rating ?? 0} ({seller.reviewCount ?? 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items Sold</span>
                      <span>{seller.itemsSold ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Response Time
                      </span>
                      <span>{seller.responseTime || "Within a day"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Member Since
                      </span>
                      <span>
                        {seller.createdAt
                          ? new Date(seller.createdAt).toLocaleDateString(
                              "en-IN",
                              { month: "short", year: "numeric" }
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary transition-all duration-300"
                    onClick={() => navigate("/messages")}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message Seller
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Similar Items */}
            {/* <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Similar Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {similarItems.map((item, i) => (
                  <div key={i} className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate mb-1">{item.name}</p>
                      <p className="text-sm text-[#2563EB]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                        ${item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card> */}
          </div>

        </div>
      </div>
    </div>
  );
}
