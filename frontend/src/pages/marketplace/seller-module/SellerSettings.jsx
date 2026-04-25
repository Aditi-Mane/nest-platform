import { useState, useEffect } from "react";
import { MdEdit } from "react-icons/md";
import api from "../../../api/axios.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext.jsx";
import toast from "react-hot-toast";
import { clearStoredToken } from "../../../utils/authStorage.js";

// /* ---------- REUSABLE COMPONENTS ---------- */

const Section = ({ title, children, onEdit, isEditing, onSave, onCancel }) => (
  <div className="bg-card rounded-2xl border border-border p-8 shadow-sm hover:shadow-md transition">

    {/* Header */}
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

    {/* Content */}
    <div className="space-y-6">{children}</div>
  </div>
);

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

const TextArea = ({ label, disabled, ...props }) => (
  <div>
    <label className="block text-sm mb-1 text-muted">{label}</label>
    <textarea
      {...props}
      disabled={disabled}
      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition min-h-25"
    />
  </div>
);

const SellerSettings = () => {
  const [loading, setLoading] = useState(true);

  const [profileImage, setProfileImage] = useState(
    "https://i.pravatar.cc/150?img=12"
  );

  const { user, setUser } = useUser();

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [storeLogoFile, setStoreLogoFile] = useState(null);
  const [payoutUPI, setPayoutUPI] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Personal Info States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [collegeName, setCollegeName] = useState("");
  const navigate = useNavigate();

  // Edit mode states
  const [editingStore, setEditingStore] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  // Edit handlers
  const startEditingStore = () => setEditingStore(true);
  const cancelEditingStore = () => setEditingStore(false);
  const saveStoreChanges = async () => {
    try {
      const formData = new FormData();

      if (storeLogoFile) formData.append("storeLogo", storeLogoFile); // file
      if (storeName) formData.append("storeName", storeName);
      if (storeDescription) formData.append("storeDescription", storeDescription);
      if (storeLocation) formData.append("storeLocation", storeLocation);

      await api.put("/users/updateStore", formData);
      toast.success("Store information updated")

      setEditingStore(false);
    } catch (error) {
      toast.error("Save store error:", error);
    }
  };

  const startEditingProfile = () => setEditingProfile(true);
  const cancelEditingProfile = () => setEditingProfile(false);
  const saveProfileChanges = async () => {
    try {
      const formData = new FormData();

      if (avatarFile) formData.append("avatar", avatarFile);
      if (collegeName) formData.append("collegeName", collegeName);
      if (payoutUPI) formData.append("payoutUPI", payoutUPI);

      await api.put("/users/updateProfile", formData);
      toast.success("Profile information updated")

      setEditingProfile(false);
    } catch (error) {
      toast.error("Save profile error:", error);
    }
  };

  // Password change modal state + behavior
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [targetRole, setTargetRole] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handlePassChange = async () => {
    if (!newPassword) {
      setPasswordError("Please enter a new password");
      return;
    }

    if (newPassword.length < 6 || !/\d/.test(newPassword)) {
      setPasswordError("Password must be at least 6 characters and contain a number");
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError("");
      await api.put("/users/updatePassword", { password: newPassword });

      setNewPassword("");
      toast.success("Password updated")
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess("");
      }, 1200);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const openPasswordModal = () => {
    setNewPassword("");
    setPasswordError("");
    setPasswordSuccess("");
    setShowPassword(false);
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordError("");
    setPasswordSuccess("");
  };

  useEffect(() => {

    const fetchUserSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get("/users/me");

        const user = res.data;
        if(user.avatar) setProfileImage(user.avatar);

        /* NEW DATA LOAD */

        if(user.storeName) setStoreName(user.storeName);

        if(user.storeDescription) setStoreDescription(user.storeDescription);

        if(user.storeLocation) setStoreLocation(user.storeLocation);

        if(user.storeLogo) setStoreLogo(user.storeLogo);

        if(user.payoutUPI) setPayoutUPI(user.payoutUPI);

        // Personal Info Load
        if(user.name) setName(user.name);
        if(user.email) setEmail(user.email);
        if(user.avatar) setAvatar(user.avatar);
        if(user.collegeName) setCollegeName(user.collegeName);

      } catch (error) {
        console.log("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();

  }, []);

  const handleSwitchClick = () => {
    if (!user) return;

    const newRole =
      user.activeRole === "buyer" ? "seller" : "buyer";

    setTargetRole(newRole);
    setShowSwitchModal(true);
  };

  const confirmSwitch = async () => {
    try {
      const res = await api.put("/users/switch-role", {
        role: targetRole,
      });

      const updatedRole = res.data.role;

      //update GLOBAL user (context)
      setUser((prev) => ({
        ...prev,
        activeRole: updatedRole,
      }));
      toast.success("Switched to " + updatedRole + " profile");

      setShowSwitchModal(false);

      navigate(`/marketplace/${updatedRole}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to switch profile"
      );
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    clearStoredToken();
    setUser(null);      
    toast.success("Logged out")             
    navigate("/auth/login");              
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);

      await api.delete("/users/delete");

      //logout after delete
      clearStoredToken();
      setUser(null);
      toast.success("User profile deleted successfully")

      navigate("/auth/login");

    } catch (error) {
      toast.error(error.response?.data);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="p-4 sm:p-6 space-y-8">

        {/* HEADER ROW */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold text-primary">Settings</h1>
            <p className="text-sm text-muted mt-1">
              Manage your store, profile and payment preferences
            </p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">

            <div className="flex-1 sm:flex-initial text-left sm:text-right">
              <h2 className="text-sm font-semibold text-text">{name}</h2>
              <p className="text-xs text-muted">{email}</p>
            </div>

            <div className="flex-shrink-0">
              <img
                src={profileImage}
                alt="Profile"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-border"
              />
            </div>

          </div>
        </div>

        {loading ? (
          <SettingsSkeleton />
        ) : (
          <>
            <Section
              title="Store Information"
              onEdit={startEditingStore}
              isEditing={editingStore}
              onSave={saveStoreChanges}
              onCancel={cancelEditingStore}
            >
              <div className="flex items-center gap-6 pb-4 border-b border-border">
                <div className="relative group">
                  <img
                    src={storeLogo || "https://via.placeholder.com/100x100?text=Logo"}
                    alt="Store Logo"
                    className="w-24 h-24 object-cover rounded-full border-2 border-border shadow-sm"
                  />

                  {editingStore && (
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                      Change
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted">Store Logo</p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setStoreLogo(URL.createObjectURL(file));
                        setStoreLogoFile(file);
                      }
                    }}
                    disabled={!editingStore}
                    className="text-xs text-muted file:mr-3 file:px-3 file:py-1.5 file:border file:border-border file:rounded-full file:text-sm file:bg-background hover:file:bg-card transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Store Name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  disabled={!editingStore}
                />

                <Input
                  label="Store Location"
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  disabled={!editingStore}
                />
              </div>

              <div>
                <TextArea
                  label="Store Description"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  disabled={!editingStore}
                />
              </div>
            </Section>

            <Section
              title="Profile Information"
              onEdit={startEditingProfile}
              isEditing={editingProfile}
              onSave={saveProfileChanges}
              onCancel={cancelEditingProfile}
            >
              <div className="flex items-center gap-6 pb-4 border-b border-border">
                <div className="relative group">
                  <img
                    src={avatar || "https://via.placeholder.com/100x100?text=Avatar"}
                    alt="Profile Avatar"
                    className="w-24 h-24 object-cover rounded-full border-2 border-border shadow-sm"
                  />

                  {editingProfile && (
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                      Change
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted">Profile Avatar</p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setAvatar(URL.createObjectURL(file));
                        setAvatarFile(file);
                      }
                    }}
                    disabled={!editingProfile}
                    className="text-xs text-muted file:mr-3 file:px-3 file:py-1.5 file:border file:border-border file:rounded-full file:text-sm file:bg-background hover:file:bg-card transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" value={name} disabled />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="College Name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  disabled={!editingProfile}
                />

                <Input
                  label="UPI ID (Optional)"
                  value={payoutUPI}
                  onChange={(e) => setPayoutUPI(e.target.value)}
                  disabled={!editingProfile}
                />
              </div>
            </Section>

            <div className="mt-6 flex justify-end gap-3 flex-wrap">
              <button
                onClick={openPasswordModal}
                className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-text hover:bg-background transition"
              >
                Change Password
              </button>

              <button
                onClick={handleSwitchClick}
                className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-primary hover:bg-background transition"
              >
                Switch Profile
              </button>

              <div className="w-px h-8 bg-border mx-1 hidden sm:block"></div>

              <button
                onClick={handleLogoutClick}
                className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-muted hover:bg-background transition"
              >
                Logout
              </button>

              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 rounded-full bg-red-500/10 text-red-600 text-sm font-semibold hover:bg-red-500/20 transition"
              >
                Delete Account
              </button>
            </div>
          </>
        )}

        {/* Password modal overlay */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
              <button
                onClick={closePasswordModal}
                className="absolute top-3 right-3 text-muted hover:text-gray-800"
                aria-label="Close password modal"
              >
                &#10005;
              </button>

              <h3 className="text-xl font-semibold text-text mb-4">Enter New Password</h3>

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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-muted"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEye/> : <FaEyeSlash/>}
                </button>
              </div>

              {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
              {passwordSuccess && <p className="text-green-500 text-sm mt-2">{passwordSuccess}</p>}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={closePasswordModal}
                  className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePassChange}
                  disabled={passwordLoading}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-60"
                >
                  {passwordLoading ? "Saving..." : "Save Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSwitchModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">

              {/* Close button */}
              <button
                onClick={() => setShowSwitchModal(false)}
                className="absolute top-3 right-3 text-muted hover:text-gray-800"
              >
                ✕
              </button>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-2 text-text">
                Switch Profile
              </h3>

              {/* Message */}
              <p className="text-sm text-muted mb-5">
                You are about to switch to{" "}
                <span className="font-semibold text-primary">
                  {targetRole}
                </span>{" "}
                mode.
              </p>

              {/* Context message */}
              <p className="text-xs text-muted mb-6">
                {targetRole === "seller"
                  ? "You will manage your store, products, and orders."
                  : "You will browse and purchase products."}
              </p>

              {/* Actions */}
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

        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">

              {/* Close */}
              <button
                onClick={() => setShowLogoutModal(false)}
                className="absolute top-3 right-3 text-muted hover:text-gray-800"
              >
                ✕
              </button>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-2 text-text">
                Logout
              </h3>

              {/* Message */}
              <p className="text-sm text-muted mb-6">
                Are you sure you want to log out of your account?
              </p>

              {/* Actions */}
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

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">

              {/* Close */}
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="absolute top-3 right-3 text-muted hover:text-gray-800"
              >
                ✕
              </button>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-2 text-red-500">
                Delete Account
              </h3>

              {/* Message */}
              <p className="text-sm text-muted mb-4">
                This action cannot be undone.
              </p>

              <p className="text-sm text-muted mb-6">
                Your account will be permanently removed and all your personal
                data will be anonymized.
              </p>

              {/* Actions */}
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
    </div>
  );
};

const SettingsSkeleton = () => (
  <div className="space-y-8">
    {[1, 2].map((section) => (
      <div
        key={section}
        className="bg-card rounded-2xl border border-border p-8 shadow-sm animate-pulse"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-background rounded"></div>
            <div className="h-6 w-40 rounded bg-background"></div>
          </div>
          <div className="h-9 w-9 rounded-full bg-background"></div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-6 pb-4 border-b border-border">
            <div className="w-24 h-24 rounded-full bg-background"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 rounded bg-background"></div>
              <div className="h-10 w-48 rounded-full bg-background"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((field) => (
              <div key={field} className="space-y-2">
                <div className="h-4 w-24 rounded bg-background"></div>
                <div className="h-12 rounded-xl bg-background"></div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-background"></div>
            <div className="h-28 rounded-xl bg-background"></div>
          </div>
        </div>
      </div>
    ))}

    <div className="flex justify-end gap-3 flex-wrap">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-10 w-32 rounded-full bg-card border border-border animate-pulse"
        ></div>
      ))}
    </div>
  </div>
);

export default SellerSettings;
