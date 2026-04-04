import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoStorefront } from "react-icons/io5";
import { MdLocationOn, MdDescription } from "react-icons/md";
import { FaMoneyBillWave } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";

import AuthLayout from "../../../components/auth/AuthLayout.jsx";
import AuthCard from "../../../components/auth/AuthCard.jsx";
import AuthHeader from "../../../components/auth/AuthHeader.jsx";
import InputField from "../../../components/auth/InputField.jsx";
import PrimaryButton from "../../../components/auth/PrimaryButton.jsx";

import api from "../../../api/axios.js";
import toast from "react-hot-toast";

const SellerSetup = () => {
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [payoutUPI, setPayoutUPI] = useState("");
  const [logo, setLogo] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("storeName", storeName);
      formData.append("storeDescription", storeDescription);
      formData.append("storeLocation", storeLocation);
      formData.append("payoutUPI", payoutUPI);

      if (logo) {
        formData.append("logo", logo);
      }

      await api.post("/seller/setup", formData);
      toast.success("Store Setup done");

      navigate("/marketplace/seller");

    } catch (err) {
      setError(err?.response?.data?.message || "Seller setup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>

        <AuthHeader
          title="Setup Your Store"
          subtitle="Complete your seller profile to start listing products on NEST."
        />

        {/* Store Name */}
        <InputField
          icon={IoStorefront}
          type="text"
          placeholder="Store Name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />

        {/* Store Description */}
        <InputField
          icon={MdDescription}
          type="text"
          placeholder="Store Description"
          value={storeDescription}
          onChange={(e) => setStoreDescription(e.target.value)}
        />

        {/* Store Location */}
        <InputField
          icon={MdLocationOn}
          type="text"
          placeholder="Campus / Store Location"
          value={storeLocation}
          onChange={(e) => setStoreLocation(e.target.value)}
        />

        {/* Payout UPI */}
        <InputField
          icon={FaMoneyBillWave}
          type="text"
          placeholder="UPI ID (Optional)"
          value={payoutUPI}
          onChange={(e) => setPayoutUPI(e.target.value)}
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-text mb-3 text-center">
            {logo ? "Store Logo Uploaded ✅" : "Upload Store Logo"}
          </label>

          <div className="relative bg-card border-2 border-dashed border-primary rounded-xl h-36 px-4 py-4 text-center cursor-pointer hover:bg-background transition flex flex-col items-center justify-center">

            <input
              type="file"
              accept="image/jpg, image/png, image/jpeg"
              onChange={(e) => setLogo(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {logo ? (
              <>
                <img
                  src={URL.createObjectURL(logo)}
                  alt="Preview"
                  className="h-16 object-contain mb-2 rounded-md"
                />

                <p className="text-xs text-secondary truncate max-w-[90%]">
                  {logo.name}
                </p>
              </>
            ) : (
              <>
                <FiUpload className="text-text text-xl mb-2" />

                <p className="text-sm text-text">
                  Click to upload
                </p>

                <p className="text-xs text-muted mt-1">
                  PNG, JPG (max 5MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p
            style={{
              color: "red",
              textAlign: "center",
              marginTop: "10px",
              marginBottom: "-10px",
              fontSize: "14px"
            }}
          >
            {error}
          </p>
        )}

        <PrimaryButton onClick={handleSubmit} disabled={loading}>
          {loading ? "Setting up store..." : "Complete Setup"}
        </PrimaryButton>

      </AuthCard>
    </AuthLayout>
  );
};

export default SellerSetup;