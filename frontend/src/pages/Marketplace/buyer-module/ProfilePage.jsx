import { useState, useEffect } from "react";
import { MdEdit } from "react-icons/md";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import ReviewModal from "../../../components/ReviewModal.jsx";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Section = ({ title, children, onEdit, isEditing, onSave, onCancel }) => {
  const showEdit = onEdit || isEditing;

  return(
    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{title}</h2>

        {showEdit &&
          (isEditing ? (
            <div className="flex gap-2">
              <button onClick={onCancel} className="px-3 py-1 border rounded">
                Cancel
              </button>
              <button onClick={onSave} className="px-3 py-1 bg-primary text-white rounded">
                Save
              </button>
            </div>
          ) : (
            <button onClick={onEdit}>
              <MdEdit />
            </button>
          ))}
      </div>

      {children}
    </div>
  );
};

const Input = ({ label, disabled, ...props }) => (
  <div>
    <label className="block text-sm mb-1">{label}</label>
    <input
      {...props}
      disabled={disabled}
      className="w-full px-4 py-2 border rounded"
    />
  </div>
);

export const ProfilePage = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [editingProfile, setEditingProfile] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileImage, setProfileImage] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);


  /* LOAD USER */
  useEffect(() => {
    const fetchUser = async () => {
      const res = await api.get("/users/me");
      const u = res.data;

      setName(u.name);
      setEmail(u.email);
      setCollegeName(u.collegeName || "");
      setAvatar(u.avatar);
      setProfileImage(u.avatar);
    };

    fetchUser();
  }, []);

  /* FETCH PURCHASES */
  async function fetchPurchases() {
    try {
      const res = await api.get("/orders/purchases");
      setPurchaseHistory(res.data.orders);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    fetchPurchases();
  }, []);

  /*  REVIEW */
  const handleReviewSubmitted = () => {
    toast.success("Product reviewed!")
    setIsReviewModalOpen(false);
    fetchPurchases(); // refresh orders after review
  };

  /* SAVE PROFILE */
  const saveProfileChanges = async () => {
    try {
      const formData = new FormData();
      if (avatarFile) formData.append("avatar", avatarFile);
      formData.append("collegeName", collegeName);

      const res = await api.put("/users/updateProfile", formData);

      // update global user context
      setUser(res.data.user);

      // update local UI
      setAvatar(res.data.user.avatar);
      setProfileImage(res.data.user.avatar);

      setEditingProfile(false);
    } catch (error) {
      console.log(error);
    }
  };

  /* SWITCH ROLE */
  const handleSwitchClick = async () => {
    try {
      const newRole = user.activeRole === "buyer" ? "seller" : "buyer";

      const res = await api.put("/users/switch-role", {
        role: newRole,
      });

      setUser((prev) => ({
        ...prev,
        activeRole: res.data.role,
      }));

      navigate(`/marketplace/${res.data.role}`);
    } catch (error) {
      console.log(error);
    }
  };

  /* LOGOUT */
  const confirmLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/auth/login");
  };

  /* DELETE */
  const confirmDelete = async () => {
    try {
      await api.delete("/users/delete");
      localStorage.removeItem("token");
      setUser(null);
      navigate("/auth/login");
    } catch (error) {
      console.log(error);
    }
  };

  /* CHANGE PASSWORD */
  const handlePassChange = async () => {
    try {
      if (!newPassword) {
        setPasswordError("Enter password");
        return;
      }

      const res = await api.put("/users/updatePassword", {
        password: newPassword,
      });

      setPasswordSuccess(res.data.message);
      setNewPassword("");

      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess("");
      }, 1200);
    } catch (error) {
      setPasswordError(
        error?.response?.data?.message || "Password update failed"
      );
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-white text-text">
      <div className="p-6 space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Profile Settings
            </h1>
            <p className="text-sm text-muted">
              Manage your profile information
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <h2 className="text-sm font-semibold">{name}</h2>
              <p className="text-xs text-muted">{email}</p>
            </div>

            <img
              src={profileImage || "https://via.placeholder.com/100"}
              className="w-16 h-16 rounded-full object-cover border"
            />
          </div>
        </div>

        {/* PROFILE INFO */}
        <Section
          title="Profile Information"
          onEdit={() => setEditingProfile(true)}
          isEditing={editingProfile}
          onSave={saveProfileChanges}
          onCancel={() => setEditingProfile(false)}
        >
          <div className="flex items-center gap-6 pb-2">
            <div className="relative group">
              <img
                src={avatar || "https://via.placeholder.com/100"}
                className="w-24 h-24 rounded-full object-cover border-2 border-border shadow-sm"
              />

              {editingProfile && (
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                  Change
                </div>
              )}
            </div>

            {editingProfile && (
              <label className="cursor-pointer px-4 py-2 rounded-full border text-sm hover:bg-background">
                Choose Photo
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setAvatar(URL.createObjectURL(file));
                      setAvatarFile(file);
                    }
                  }}
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input label="Full Name" value={name} disabled />
            <Input label="Email Address" value={email} disabled />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input
              label="College Name"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              disabled={!editingProfile}
            />
          </div>
        </Section>

        {/* ORDER */}
        <Section title="Orders">
          {purchaseHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No orders yet.
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseHistory
                .filter(order => order !== null)
                .map((order) => (
                  <Card key={order._id} className="rounded-2xl hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-5">

                        {/* IMAGE */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden border">
                          <img
                            src={order.product?.images?.[0]?.url || "/placeholder.png"}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* INFO */}
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {order.product?.name}
                          </h4>

                          <p className="text-sm text-muted-foreground">
                            Seller: {order.seller?.name}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            Qty: {order.quantity}
                          </p>

                          <p className="text-xs text-muted mt-1">
                            {order.createdAt
                              ? formatDistanceToNow(new Date(order.createdAt), {
                                  addSuffix: true,
                                })
                              : "Recently"}
                          </p>
                        </div>

                        {/* PRICE */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary">
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
                            {order.reviewed ? "Reviewed" : "Leave Review"}
                          </Button>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </Section>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 flex-wrap">
          <button onClick={() => setIsPasswordModalOpen(true)} className="px-4 py-2 border rounded">
            Change Password
          </button>

          <button onClick={handleSwitchClick} className="px-4 py-2 border rounded">
            Switch Profile
          </button>

          <button onClick={confirmLogout} className="px-4 py-2 border rounded">
            Logout
          </button>

          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-500/10 text-red-600 rounded"
          >
            Delete Account
          </button>
        </div>

      </div>

      {/* PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>

            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 border rounded-xl"
            />

            {passwordError && (
              <p className="text-red-500 text-sm mt-2">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-green-500 text-sm mt-2">{passwordSuccess}</p>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handlePassChange}
                className="px-4 py-2 bg-primary text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {isReviewModalOpen && (
        <ReviewModal
          productId={selectedProduct}
          onClose={handleReviewSubmitted}
        />
      )}
    </div>
  );
};