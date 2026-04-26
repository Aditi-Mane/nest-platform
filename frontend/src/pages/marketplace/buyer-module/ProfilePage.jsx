import { useState, useEffect } from "react";
import { MdEdit } from "react-icons/md";
import api from "../../../api/axios.js";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext.jsx";
import ReviewModal from "../../../components/ReviewModal.jsx";
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
import ComplaintModal from "../../../components/ComplaintModal.jsx";
import { clearStoredToken } from "../../../utils/authStorage.js";
import toast from "react-hot-toast";

const Section = ({ title, children, onEdit, isEditing, onSave, onCancel }) => {
  return(
    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded"></div>
          <h2 className="text-lg font-semibold text-text">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={onCancel}
                className="px-3 py-1.5 text-sm rounded-full border border-border text-muted hover:text-text hover:bg-background transition"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="px-4 py-1.5 text-sm rounded-full bg-primary text-white hover:bg-primary/90 transition font-medium"
              >
                Save
              </button>
            </>
          ) : (
            onEdit && (
              <button
                onClick={onEdit}
                className="p-2 rounded-full hover:bg-background text-muted hover:text-primary transition"
                aria-label={`Edit ${title}`}
              >
                <MdEdit size={18} />
              </button>
            )
          )}
        </div>
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
};

const Input = ({ label, disabled, ...props }) => (
  <div>
    <label className="block text-sm mb-1 text-muted">{label}</label>
    <input
      {...props}
      disabled={disabled}
      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
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
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

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

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetRole, setTargetRole] = useState("buyer");
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* SWITCH ROLE */
  const handleSwitchClick = () => {
    if (!user) return;
    const newRole = user.activeRole === "buyer" ? "seller" : "buyer";
    setTargetRole(newRole);
    setShowSwitchModal(true);
  };

  const confirmSwitch = async () => {
    try {
      const res = await api.put("/users/switch-role", { role: targetRole });
      setUser((prev) => ({ ...prev, activeRole: res.data.role }));
      setShowSwitchModal(false);
      navigate(`/marketplace/${res.data.role}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to switch profile"
      );
    }
  };

  /* LOGOUT */
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    clearStoredToken();
    setUser(null);
    navigate("/auth/login");
    setShowLogoutModal(false);
  };

  /* DELETE */
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.delete("/users/delete");
      clearStoredToken();
      setUser(null);
      setShowDeleteModal(false);
      navigate("/auth/login");
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteLoading(false);
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
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-primary">
              Profile Settings
            </h1>
            <p className="text-sm text-muted mt-1">
              Manage your profile information
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 md:justify-end">
            <div className="min-w-0 flex-1 text-left md:flex-none md:text-right">
              <h2 className="text-sm font-semibold">{name}</h2>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>

            <img
              src={profileImage || "https://via.placeholder.com/100"}
              className="h-16 w-16 shrink-0 rounded-full object-cover border"
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
              <label className="cursor-pointer px-4 py-2 rounded-full border text-sm hover:bg-background border-border text-text">
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

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 flex-wrap">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-4 py-2 text-sm rounded-full border border-border text-muted hover:text-text hover:bg-background transition"
          >
            Change Password
          </button>

          <button
            onClick={handleSwitchClick}
            className="px-4 py-2 text-sm rounded-full border border-border text-muted hover:text-text hover:bg-background transition"
          >
            Switch Profile
          </button>

          <button
            onClick={handleLogoutClick}
            className="px-4 py-2 text-sm rounded-full border border-border text-muted hover:text-text hover:bg-background transition"
          >
            Logout
          </button>

          <button
            onClick={handleDeleteClick}
            className="px-4 py-2 text-sm rounded-full bg-red-500/20 bg-opacity-10 text-red-600 hover:bg-red-500 hover:text-white transition"
          >
            Delete Account
          </button>
        </div>

        {/* ORDER */}
        <Section title="Orders">
          {purchaseHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No orders yet.
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseHistory
  .filter((order) => order !== null)
  .map((order) => (
    <div
      key={order._id}
      className="rounded-2xl overflow-hidden transition-all hover:shadow-lg border bg-white"
      
    >
      {/* ── TOP STRIP: status + date ── */}
      <div
        className="flex items-center justify-between px-5 py-2.5 "
        
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: "#d97706" }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#92400e" }}>
            Completed
          </span>
        </div>
        <span className="text-xs" style={{ color: "#a16207" }}>
          {order.createdAt
            ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })
            : "Recently"}
        </span>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex gap-5 p-5 ">
        {/* Product image */}
        <div
          className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0"
          style={{ border: "1px solid #CFAE8E" }}
        >
          <img
            src={order.product?.images?.[0]?.url || "/placeholder.png"}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base truncate text-primary" >
            {order.product?.name}
          </h4>

          <div className="flex items-center gap-1.5 mt-1">
            <div
              className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0"
              style={{ border: "1px solid #fde68a" }}
            >
              {order.seller?.avatar ? (
                <img src={order.seller.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[9px] font-bold bg-muted/40"
                    >
                  {order.seller?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-xs" style={{ color: "#a16207" }}>
              {order.seller?.name}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
            >
              Qty: {order.quantity}
            </span>
            <span className="text-xl font-bold" style={{ color: "#d97706" }}>
              ₹{order.totalPrice}
            </span>
          </div>
        </div>
      </div>

      {/* ── ACTION ROW ── */}
      <div
        className="flex items-center justify-end gap-2 px-5 py-3 "
        style={{ borderTop: "1px solid  #CFAE8E", background: "#fffdf7" }}
      >
        {/* Leave Review */}
        <button
          disabled={order.reviewed}
          onClick={() => {
            setSelectedProduct(order.product._id);
            setIsReviewModalOpen(true);
          }}
          className="px-4 py-1.5 text-xs font-semibold rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={
            order.reviewed
              ? { background: "#a8a29e", color: "black", }
              : {
                  background: "#d97706",
                  color: "white",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(217,119,6,0.25)",
                }
          }
        >
          {order.reviewed ? "✓ Reviewed" : "Leave Review"}
        </button>

        {/* Divider */}
        <div className="w-px h-4  bg-primary"/>

        {/* Report Seller */}
        <button
          onClick={() => {
              setSelectedProduct(order.product?._id || order.product);
              setSelectedSeller(order.seller?._id || order.seller);
              setIsComplaintModalOpen(true);
            }}
          className="px-4 py-1.5 text-xs font-semibold rounded-full transition hover:bg-red-50"
          style={{ border: "1px solid #fca5a5", color: "#dc2626", background: "white" }}
        >
          Report Seller
        </button>
      </div>
    </div>
  ))}
            </div>
          )}
        </Section>

      </div>

      {/* PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-3 right-3 text-muted hover:text-gray-800"
              aria-label="Close password modal"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4">Change Password</h3>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                aria-label="Toggle password visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {passwordError && (
              <p className="text-red-500 text-sm mt-2">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-green-500 text-sm mt-2">{passwordSuccess}</p>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePassChange}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90"
              >
                Save Password
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

      {isComplaintModalOpen && (
        <ComplaintModal
          productId={selectedProduct}
          sellerId={selectedSeller}
          sellerName={purchaseHistory.find(o => o.seller?._id === selectedSeller)?.seller?.name}
          onClose={() => setIsComplaintModalOpen(false)}
        />
      )}

      {/* Switch Confirmation */}
      {showSwitchModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
            <button
              onClick={() => setShowSwitchModal(false)}
              className="absolute top-3 right-3 text-muted hover:text-gray-800"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-2 text-text">Switch Profile</h3>
            <p className="text-sm text-muted mb-6">
              You are about to switch to <span className="font-semibold text-primary">{targetRole}</span> mode.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitch}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90"
              >
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-3 right-3 text-muted hover:text-gray-800"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-2 text-text">Logout</h3>
            <p className="text-sm text-muted mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
              className="absolute top-3 right-3 text-muted hover:text-gray-800"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-2 text-red-500">Delete Account</h3>
            <p className="text-sm text-muted mb-4">This action cannot be undone.</p>
            <p className="text-sm text-muted mb-6">
              Your account will be permanently removed and all your personal data will be anonymized.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-gray-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
