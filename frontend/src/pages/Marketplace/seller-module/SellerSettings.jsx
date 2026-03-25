import { useState, useEffect } from "react";
import { MdEdit } from "react-icons/md";
import api from "../../../api/axios";

// /* ---------- REUSABLE COMPONENTS ---------- */

const Section = ({ title, children, onEdit, isEditing, onSave, onCancel }) => (
  <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="w-1.5 h-6 bg-primary rounded mr-3"></div>
        <h2 className="text-lg font-semibold text-text">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <button
              onClick={onCancel}
              className="text-sm text-muted hover:text-text transition"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="text-sm text-primary hover:text-primary/80 transition font-medium"
            >
              Save
            </button>
          </>
        ) : (
          onEdit && (
            <button
              onClick={onEdit}
              className="text-muted hover:text-primary transition"
              aria-label={`Edit ${title}`}
            >
              <MdEdit />
            </button>
          )
        )}
      </div>
    </div>
    <div className="space-y-5">{children}</div>
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

  const [profileImage, setProfileImage] = useState(
    "https://i.pravatar.cc/150?img=12"
  );

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [storeLogoFile, setStoreLogoFile] = useState(null);
  const [payoutUPI, setPayoutUPI] = useState("");

  // Personal Info States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [collegeName, setCollegeName] = useState("");

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

      setEditingStore(false);
    } catch (error) {
      console.log("Save store error:", error);
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

      setEditingProfile(false);
    } catch (error) {
      console.log("Save profile error:", error);
    }
  };

  useEffect(() => {

    const fetchUserSettings = async () => {
      try {

        const token = localStorage.getItem("token");

        const res = await api.get("/users/me");

        const user = res.data;

        if(user.avatar) setProfileImage(user.avatar);

        if(user.notifications) setNotifications(user.notifications);

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
      }
    };

    fetchUserSettings();

  }, []);

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* HEADER ROW */}
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-primary">Settings</h1>
            <p className="text-sm text-muted mt-1">
              Manage your store, profile and payment preferences
            </p>
          </div>

          <div className="flex items-center gap-4">

            <div className="text-right">
              <h2 className="text-sm font-semibold text-text">{name}</h2>
              <p className="text-xs text-muted">{email}</p>
            </div>

            <div>
              <img
                src={profileImage}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-border"
              />
            </div>

          </div>
        </div>


        {/* STORE INFORMATION */}
        <Section
          title="Store Information"
          onEdit={startEditingStore}
          isEditing={editingStore}
          onSave={saveStoreChanges}
          onCancel={cancelEditingStore}
        >
          <div className="mb-6">
            <label className="block text-sm mb-2 text-muted">Store Logo</label>
            <div className="flex items-center gap-4">
              <img
                src={storeLogo || "https://via.placeholder.com/80x80?text=Logo"}
                alt="Store Logo"
                className="w-20 h-20 object-cover border border-border rounded-lg"
              />
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
                className="text-sm text-muted"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">

            <Input
              label="Store Name"
              value={storeName}
              onChange={(e)=>setStoreName(e.target.value)}
              disabled={!editingStore}
            />

            <Input
              label="Store Location"
              value={storeLocation}
              onChange={(e)=>setStoreLocation(e.target.value)}
              disabled={!editingStore}
            />

          </div>

          <TextArea
            label="Store Description"
            value={storeDescription}
            onChange={(e)=>setStoreDescription(e.target.value)}
            disabled={!editingStore}
          />
        </Section>


        {/* PROFILE INFORMATION */}
        <Section
          title="Profile Information"
          onEdit={startEditingProfile}
          isEditing={editingProfile}
          onSave={saveProfileChanges}
          onCancel={cancelEditingProfile}
        >
          <div className="mb-6">
            <label className="block text-sm mb-2 text-muted">Profile Avatar</label>
            <div className="flex items-center gap-4">
              <img
                src={avatar || "https://via.placeholder.com/80x80?text=Avatar"}
                alt="Profile Avatar"
                className="w-20 h-20 object-cover border border-border rounded-full"
              />
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
                className="text-sm text-muted"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={true}
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={true}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="College Name"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              disabled={!editingProfile}
            />
            <Input
              label="UPI ID (Optional)"
              value={payoutUPI}
              onChange={(e)=>setPayoutUPI(e.target.value)}
              disabled={!editingProfile}
            />
          </div>
        </Section>

        {/* PROFILE ACTIONS */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => handlePassChange}
            className="px-4 py-2 rounded-full border border-border text-sm hover:bg-background"
          >
            Change Password
          </button>
          <button
            onClick={() => handleSwitch}
            className="px-4 py-2 rounded-full border border-border text-sm hover:bg-background"
          >
            Switch Profile
          </button>
          <button
            onClick={() => handleDelete}
            className="px-4 py-2 rounded-full border border-red-300 text-sm text-red-500 hover:bg-red-50"
          >
            Delete Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default SellerSettings;