import { useState, useEffect } from "react";
import { ShoppingBag, Package } from "lucide-react";
import ReviewModal from "../../../components/ReviewModal.jsx";
import { formatDistanceToNow } from "date-fns";
import api from "@/api/axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfilePage() {

  const [user, setUser] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH DATA =================
  useEffect(() => {
    async function fetchData() {
      try {
        const profileRes = await api.get("/users/me");
        const purchaseRes = await api.get("/orders/purchases");

        setUser(profileRes.data);
        setPurchaseHistory(purchaseRes.data.orders);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ================= REVIEW HANDLER =================
  const handleReviewSubmitted = () => {
    setIsReviewModalOpen(false);
  };

  // ================= SAVE PROFILE =================
  const handleSave = async () => {
    try {
      const res = await api.put("/users/me", user);
      setUser(res.data);
      setShowEditModal(false);
    } catch (error) {
      console.error("Profile update failed", error);
    }
  };

  // ================= IMAGE UPLOAD =================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.put("/users/update-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data);
    } catch (error) {
      console.error("Image upload failed", error);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Failed to load profile
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* PROFILE HEADER */}
        <Card className="rounded-2xl mb-8">
          <CardContent className="p-8 flex gap-8">

            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-28 w-28">
                <AvatarImage
                  src={
                    user?.avatar
                      ? `http://localhost:5000${user.avatar}`
                      : undefined
                  }
                />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                Edit Profile
              </Button>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-semibold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>

              <div className="flex gap-2 flex-wrap mt-3">
                {user.university && (
                  <Badge variant="secondary">{user.university}</Badge>
                )}
                {user.major && (
                  <Badge variant="secondary">{user.major}</Badge>
                )}
                {user.year && (
                  <Badge variant="secondary">{user.year}</Badge>
                )}
              </div>

              {user.bio && (
                <p className="text-sm text-muted-foreground mt-2">
                  {user.bio}
                </p>
              )}
            </div>

          </CardContent>
        </Card>

        {/* PURCHASES TAB */}
        <Tabs defaultValue="purchases">
          <TabsList>
            <TabsTrigger value="purchases">
              <ShoppingBag className="h-4 w-4 mr-2"/>
              Purchases
            </TabsTrigger>

            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2"/>
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchases" className="space-y-4">

            {purchaseHistory.map((order) => (
              <Card key={order._id}>
                <CardContent className="p-6 flex justify-between">

                  <div>
                    <h4 className="font-semibold">
                      {order.productId?.name}
                    </h4>

                    <p className="text-sm text-muted">
                      Seller: {order.sellerId?.name}
                    </p>

                    <p className="text-sm text-muted">
                      {formatDistanceToNow(
                        new Date(order.updatedAt),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{order.totalPrice}
                    </p>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={order.reviewed}
                      onClick={() => {
                        setSelectedProduct(order.productId._id);
                        setIsReviewModalOpen(true);
                      }}
                    >
                      {order.reviewed ? "Reviewed" : "Leave Review"}
                    </Button>
                  </div>

                </CardContent>
              </Card>
            ))}

          </TabsContent>
        </Tabs>
      </div>

      {/* REVIEW MODAL */}
      {isReviewModalOpen && (
        <ReviewModal
          productId={selectedProduct}
          onClose={handleReviewSubmitted}
        />
      )}

    </div>
  );
}