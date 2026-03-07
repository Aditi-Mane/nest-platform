import api from "@/api/axios";
import { useState, useEffect } from "react";
import { ShoppingBag, Package } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function ProfilePage() {

  const { user, setUser, loading } = useUser();
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);

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

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Failed to load profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ================= PROFILE HEADER ================= */}
        <Card className="rounded-2xl mb-8 shadow-sm">
          <CardContent className="p-8 flex gap-8">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-28 w-28">
                <AvatarImage
                  src={
                    user?.avatar
                      ? `http://localhost:5000${user.avatar}`
                      : undefined
                  }
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold">
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

            {/* User Info */}
            <div className="flex-1 space-y-3">
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

        {/* ================= TABS ================= */}
        <Tabs defaultValue="purchases">
          <TabsList className="mb-6">
            <TabsTrigger value="purchases">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Purchases
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchases">
            {purchaseHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No purchases yet.
              </div>
            ) : (
              <div className="space-y-4">
                {purchaseHistory.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition">
                    <CardContent className="p-4 flex justify-between">
                      <span>{item.name}</span>
                      <span className="font-medium">
                        ₹{item.price.toLocaleString()}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-xl relative">

            {/* Close */}
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold mb-6">
              Edit Profile
            </h2>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <Avatar className="h-28 w-28">
                <AvatarImage
                  src={
                    user?.avatar
                      ? `http://localhost:5000${user.avatar}`
                      : undefined
                  }
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="University"
                value={user.university || ""}
                onChange={(e) =>
                  setUser({ ...user, university: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="Major"
                value={user.major || ""}
                onChange={(e) =>
                  setUser({ ...user, major: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="Year"
                value={user.year || ""}
                onChange={(e) =>
                  setUser({ ...user, year: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <textarea
                placeholder="Bio"
                value={user.bio || ""}
                onChange={(e) =>
                  setUser({ ...user, bio: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}