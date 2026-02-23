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

    

    useEffect(() => {
        async function fetchProfile() {
            try {
            const res = await api.get("/users/me");
            setUser(res.data);
            } catch (error) {
            console.error(error);
            }
        }

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
        <Tabs defaultValue="Listings">
          <TabsList>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases">
            <div className="space-y-4">
              {purchaseHistory.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex justify-between">
                    <span>{item.name}</span>
                    <span>${item.price}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}