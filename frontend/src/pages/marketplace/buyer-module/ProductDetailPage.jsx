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
  Shield,
  Sparkles
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
// import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import ImageWithFallBack from "../../../components/figma/ImageWithFallBack.jsx";
import { Separator } from "@/components/ui/separator";
import { useParams, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import api from "../../../api/axios.js";
import { useCart } from "../../../context/CartContext.jsx";
import ComplaintModal from "../../../components/ComplaintModal.jsx";

export default function ProductDetailPage() {
  const { addToCart } = useCart();
  const { id } = useParams();
  const navigate = useNavigate(); 
  const[product, setProduct]=useState(null);
  const isUnavailable = product?.status !== "available";
  const seller = product?.createdBy;


  const [reviews, setReviews] =useState([]);
  const [loadingReviews, setLoadingReviews] =useState(true);
  const [conversation, setConversation] = useState(null);
  const [sellerRating, setSellerRating] = useState(0.0);
  const [reviewCount, setReviewCount] = useState(0); 
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);   
  const location = useLocation();

  const conversationStatus = conversation?.status || null;
  const productStatus = product?.status;


  //selected photo
  const [selectedImage, setSelectedImage] = useState(null);

const getContactButtonText = (status, productStatus) => {
  if (productStatus === "sold") return "Sold Out";
  if (productStatus === "reserved") return "Currently Reserved";

  if (!status) return "Contact Seller";

  switch (status) {
    case "initiated":
      return "Contact Seller";
    case "negotiating":
      return "Continue Negotiation";
    case "deal_confirmed":
      return "Deal Confirmed";
    case "cancelled":
      return "Retry Contact";
    default:
      return "Contact Seller";
  }
};
//for contact button
const getButtonStyle = (status, productStatus) => {
  if (productStatus === "sold") {
    return "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
  }

  if (productStatus === "reserved") {
    return "bg-orange-50 text-orange-600 border-orange-100";
  }

  switch (status) {
    case "deal_confirmed":
      return "bg-green-100 text-green-700 border-green-200";
    case "negotiating":
      return "bg-yellow-50 text-yellow-600 border-yellow-100";
    case "cancelled":
      return "bg-red-50 text-red-600 border-red-100";
    default:
      return "bg-green-50 text-green-600 border-green-100";
  }
};

const getHoverStyle = (status, productStatus) => {
  if (productStatus === "sold") return "";

  if (productStatus === "reserved") {
    return "hover:!bg-orange-100 hover:!text-orange-700";
  }

  switch (status) {
    case "deal_confirmed":
      return "hover:!bg-green-200 hover:!text-green-800";
    case "negotiating":
      return "hover:!bg-yellow-100 hover:!text-yellow-700";
    case "cancelled":
      return "hover:!bg-red-100 hover:!text-red-700";
    default:
      return "hover:!bg-green-100 hover:!text-green-700";
  }
};

const isContactButtonDisabled = (status, productStatus) => {
  return (
   
    productStatus === "sold" ||
    productStatus === "reserved"
  );
};


const getSoftButtonStyle = (productStatus, conversationStatus, type = "contact") => {
  if (productStatus === "sold") {
    return "bg-muted text-background border border-border";
  }

  if (type === "cart") {
    return "bg-blue-50 text-blue-600 border-blue-100";
  }

  switch (conversationStatus) {
    case "deal_confirmed":
      return "bg-green-100 text-green-700 border-green-200";
    case "negotiating":
      return "bg-yellow-50 text-yellow-600 border-yellow-100";
    case "cancelled":
      return "bg-red-50 text-red-600 border-red-100";
    default:
      return "bg-green-50 text-green-600 border-green-100";
  }
};

const getSoftHover = (productStatus, conversationStatus, type = "contact") => {
  if (productStatus === "sold") return "";

  if (type === "cart") {
    return "hover:!bg-blue-100 hover:!text-blue-700";
  }

  switch (conversationStatus) {
    case "negotiating":
      return "hover:!bg-yellow-100 hover:!text-yellow-700";
    case "cancelled":
      return "hover:!bg-red-100 hover:!text-red-700";
    default:
      return "hover:!bg-green-100 hover:!text-green-700";
  }
};


const fetchConversation = async () => {
  try {
    const res = await api.get("/conversations/buyer");  // same as CartPage
    const matched = res.data.conversations.find(
      (c) => c.productId?._id === id
    );
    setConversation(matched || null);
  } catch (err) {
    // no conversation → fine
  }
};

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
      const fetchRecommendations = async () => {
      try {
        const res = await api.get(`/products/recommend-ml/${id}`);
        setRecommendations(res.data.recommendations);
      } catch (err) {
        console.log("ML rec error", err);
      } finally {
        setLoadingRecs(false);
      }
    };




      
    fetchConversation();
    fetchProduct();
    fetchReviews();
    fetchRecommendations();
    

  },[id, location ]);

  useEffect(() => {
  const fetchRating = async () => {
    const res = await api.get(`/seller/seller-rating/${seller._id}`);

    setSellerRating(res.data.avgRating);
    setReviewCount(res.data.totalReviews);
  };

  if (seller?._id) fetchRating();
}, [seller]);


console.log("UPDATED STATUS:", conversation?.status);

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

  const renderPurchaseCard = (className = "") => (
    <Card className={`rounded-2xl border-border top-24 self-start ${className}`.trim()}>
      <CardContent className="p-6 space-y-4">
        <Button
          size="lg"
          className={`w-full rounded-xl border transition-all duration-200
            ${getSoftButtonStyle(product?.status, conversation?.status, "cart")}
            ${getSoftHover(product?.status, conversation?.status, "cart")}
            shadow-none!
          `}
          disabled={isUnavailable}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {product?.status === "sold"
            ? "Sold Out"
            : product?.status === "reserved"
            ? "Reserved"
            : "Add to Cart"}
        </Button>

        <Button
          size="lg"
          className={`w-full rounded-xl border 
            ${getButtonStyle(conversationStatus, productStatus)}
            ${getHoverStyle(conversationStatus, productStatus)}
            shadow-none! transition-all`}
          disabled={isContactButtonDisabled(conversationStatus, productStatus)}
          onClick={async () => {
            try {
              await addToCart(product._id);

              let conversationId = conversation?._id;

              if (
                !conversationId ||
                conversation?.status === "cancelled" ||
                conversation?.status === "completed"
              ) {
                const res = await api.post("/conversations/create", {
                  productId: product._id,
                });

                const newConversation = res.data.conversation;

                conversationId = newConversation._id;

                setConversation(newConversation);
              }

              navigate(`/marketplace/buyer/messages/${conversationId}`);
            } catch (error) {
              console.error(error);
              alert("Something went wrong");
            }
          }}
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          {getContactButtonText(conversationStatus, productStatus)}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          <Shield className="h-5 w-5 mx-auto mb-2" />
          <p>Secure payment through Nest</p>
          <p>Money-back guarantee</p>
        </div>
      </CardContent>
    </Card>
  );

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
                
                <ImageWithFallBack
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
                    <ImageWithFallBack
                      src={imgObj.url}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Details */}
            <Card className="rounded-2xl border-border">
              <CardContent className="p-6">
                <h1 className="text-3xl mb-2 font-bold">{product.name}</h1>

                <div className="flex gap-2 mb-4">
                 <Badge className="bg-secondary text-white">
                {product.category}
                </Badge>
                 { product.condition? <Badge variant="outline">{product.condition}</Badge> : ""}
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
                    ? "bg-linear-to-r from-red-500 to-rose-600 text-white shadow-sm"
                    : product?.status === "reserved"
                    ? "bg-linear-to-r from-amber-400 to-orange-500 text-white shadow-sm"
                    : "bg-linear-to-r from-emerald-400 to-green-600 text-white shadow-sm"
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
            <div className="lg:hidden">
              {renderPurchaseCard()}
            </div>
           {/* Reviews Section */}
<Card className="rounded-2xl bg-card/80 backdrop-blur-sm border-border shadow-sm">
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <p>Reviews</p>

      <div className="flex items-center gap-1 text-sm mb-2">
          <Star className="h-4 w-4 fill-primary text-primary" />

          {product.reviewCount > 0 ? (
            <span className="text-muted-foreground">
              {product.averageRating.toFixed(1)} ({product.reviewCount})
            </span>
          ) : (
            <span className="text-muted-foreground opacity-70">
              No reviews yet
            </span>
          )}
        </div>
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
            <div className="hidden lg:block">
              {renderPurchaseCard()}
            </div>

            {/* Seller Card */}
           
            {seller && (
              <Card className="rounded-2xl border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
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
                          {sellerRating} ({reviewCount} reviews)
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

        
                </CardContent>
              </Card>
            )}

           <Card className="rounded-2xl border-border shadow-sm hover:shadow-md transition-all duration-300">
  <CardHeader className="pb-2">
    <CardTitle className="flex items-center gap-2 text-base font-semibold">
      <Sparkles className="h-5 w-5 text-primary" />
      Recommended for you
    </CardTitle>
  </CardHeader>

            <CardContent className="space-y-3">
              {loadingRecs && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Finding best matches...
                </div>
              )}

               {/* Recommendations */}
              {!loadingRecs && recommendations.length === 0 && (
                <p className="text-sm text-muted text-center py-4">
                  No recommendations yet
                </p>
              )}

              {recommendations.map((item) => (
                <div
                  key={item._id}
                  onClick={() =>
                    navigate(`/marketplace/buyer/product/${item._id}`)
                  }
                  className="flex cursor-pointer gap-3 rounded-xl border border-border bg-card p-2.5 transition-colors duration-200 hover:bg-background"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden border bg-white shrink-0">
                    <img
                      src={item.images?.[0]?.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <p className="text-sm font-medium line-clamp-1">
                      {item.name}
                    </p>
                    {/* Rating */}
                    <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted">
                        ⭐ {item.averageRating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Similar
                      </span>
                    </div>
                    {/* Price + subtle tag */}
                   
                      <p className="text-sm text-primary font-semibold">
                        ₹{item.price}
                      </p>

                      
                    
                  </div>
                </div>
              ))}

              {/* Optional CTA */}
              {!loadingRecs && recommendations.length > 0 && (
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    className="w-full text-sm text-primary hover:bg-primary/10 rounded-xl"
                    onClick={() => navigate("/marketplace")}
                  >
                    Explore more →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
