import { useState, useEffect } from "react";
import {
  Settings,
  Edit,
  ShoppingBag,
  DollarSign,
  Package,
  Award,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Sparkles,
  Star
} from "lucide-react";
import ReviewModal from "../../../components/ReviewModal.jsx"
import { formatDistanceToNow } from "date-fns";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ProductCard";
import { StatCard } from "@/components/StatCard";


   
export function ProfilePage({ onNavigate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(null);

    const [purchaseHistory, setPurchaseHistory] = useState([]);

    
    const [isReviewModalOpen, setIsReviewModalOpen] =useState(false);
    const [selectedProduct, setSelectedProduct] =useState(null);
    const handleReviewSubmitted = () => {
      setIsReviewModalOpen(false);
      fetchPurchases();
    };
    

     async function fetchPurchases(){
          try{
            const res= await api.get("/orders/purchases");
            setPurchaseHistory(res.data.orders);
          }catch (error) {
              console.error(error);
            }
     }

    useEffect(() => {
        async function fetchProfile() {
            try {
            const res = await api.get("/users/me");
            setUser(res.data);
            } catch (error) {
            console.error(error);
            }
        }
       
        fetchPurchases();
        fetchProfile();
    }, []);


  
    if (!user) {
        return <div className="p-10">Loading profile...</div>;
    }
  
    
    return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* HEADER */}
        <Card className="rounded-2xl mb-8">
          <CardContent className="p-8">
            <div className="flex gap-6 items-start">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.avatar} />
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl mb-2">{user.name}</h1>
                <p className="text-muted-foreground mb-2">{user.email}</p>

                <div className="flex gap-2 mb-3 flex-wrap">
                  <Badge variant="secondary">{user.university}</Badge>
                  <Badge variant="secondary">{user.major}</Badge>
                  <Badge variant="secondary">{user.year}</Badge>
                </div>

                <p className="text-muted-foreground mb-4">{user.bio}</p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Save" : "Edit Profile"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TABS */}
        <Tabs defaultValue="purchases">
          <TabsList>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            
          </TabsList>

          <TabsContent value="purchases" className="space-y-6">

          <div className="mb-6">
            <h2 className="text-2xl">Purchase History</h2>
            <p className="text-muted-foreground">
              Items you've bought from other students
            </p>
          </div>

          <div className="space-y-4">
        {purchaseHistory.map((order) => (
          <Card
            key={order._id}
            className="rounded-2xl px-2 transition-all hover:shadow-md"
          >
            <CardContent className="p-6">

              <div className="flex items-center gap-5">

                {/* PRODUCT IMAGE */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border">
                  <img
                    src={order.product?.images?.[0]?.url || "/placeholder.png"}
                    alt={order.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 space-y-1">

                  <h4 className="font-semibold text-base">
                    {order.product?.name}
                  </h4>

                  <p className="text-sm text-muted-foreground">
                    Seller: {" "}
                    <span className="text-primary font-medium">
                      {order.seller?.name}
                    </span>
                  </p>

                  <p className="text-sm font-medium text-muted-foreground">
                    Qty: {order.quantity}
                  </p>

                  <div className="flex items-center gap-2.5 mt-2">

                    <Badge className="bg-green-500 text-white rounded-xl">
                      Delivered
                    </Badge>

                    <p className="text-xs text-muted">
                      {order.createdAt
                        ? formatDistanceToNow(new Date(order.createdAt), {
                            addSuffix: true,
                          })
                        : "Recently"}
                    </p>

                  </div>

                </div>

                {/* PRICE + REVIEW */}
                <div className="text-right flex flex-col items-end gap-2">

                  <p className="text-xl font-semibold text-primary">
                    ₹{order.totalPrice}
                  </p>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={order.reviewed}
                    onClick={() => {
                      setSelectedProduct(order.product._id);
                      setIsReviewModalOpen(true);
                    }}
                  >
                    {order.reviewed ? "Reviewed" : "Leave a Review"}
                  </Button>

                </div>

              </div>

            </CardContent>
          </Card>
        ))}
      </div>

        </TabsContent>

        </Tabs>
      </div>
        {isReviewModalOpen && (
      <ReviewModal
        productId={selectedProduct}
        onClose={handleReviewSubmitted}
      />
    )}
    </div>
      

  );
  
}
