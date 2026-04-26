import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaIdCard } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import api from "../../api/axios.js";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import InputField from "../../components/auth/InputField.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";

const VerifyAccount = () => {
  const [prn, setPrn] = useState("");
  const [idImg, setIdImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const allowedImageTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/heic",
    "image/heif",
  ]);
  const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

  const isAllowedImageFile = (file) => {
    const fileName = file.name?.toLowerCase() || "";

    return (
      allowedImageTypes.has(file.type) ||
      allowedImageExtensions.some((extension) => fileName.endsWith(extension))
    );
  };

  useEffect(() => {
    if (!idImg || !idImg.type.startsWith("image/")) {
      setPreviewUrl("");
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(idImg);
    setPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [idImg]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setIdImg(null);
      return;
    }

    if (!isAllowedImageFile(file)) {
      setError("Only JPG, JPEG, PNG, WEBP, HEIC, or HEIF images are allowed");
      setIdImg(null);
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("ID card image must be 5MB or smaller");
      setIdImg(null);
      e.target.value = "";
      return;
    }

    setError("");
    setIdImg(file);
  };

  const handleVerify = async () => {
    try {
      setError("");

      if (!prn.trim()) {
        setError("PRN is required");
        return;
      }

      if (!idImg) {
        setError("Please upload your college ID card");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("collegeId", prn.trim());
      formData.append("idCard", idImg);

      await api.post("/auth/verify-account", formData);

      navigate("/auth/registration", { replace: true });
    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Verify Account"
          subtitle="Enter additional details to get verified as a student of Sinhgad Institutes."
        />

        <InputField
          icon={FaIdCard}
          type="text"
          placeholder="PRN number"
          value={prn}
          onChange={(e) => setPrn(e.target.value)}
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-text mb-3 text-center">
            {idImg ? "College ID uploaded" : "Upload College ID Card"}
          </label>

          <div className="relative bg-card border-2 border-dashed border-primary rounded-xl px-4 py-6 text-center cursor-pointer hover:bg-background transition">
            <input
              type="file"
              accept="image/*,.heic,.heif,.webp"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {idImg && previewUrl ? (
              <div className="flex flex-col items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 object-contain rounded-lg"
                />

                <p className="text-xs text-green-500 mt-2">{idImg.name}</p>
              </div>
            ) : idImg ? (
              <div className="flex flex-col items-center justify-center">
                <FiUpload className="text-text text-2xl mb-2" />

                <p className="text-sm text-text">{idImg.name}</p>

                <p className="text-xs text-muted mt-1">
                  File selected successfully
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <FiUpload className="text-text text-2xl mb-2" />

                <p className="text-sm text-text">Click to upload or drag & drop</p>

                <p className="text-xs text-muted mt-1">
                  PNG, JPG, JPEG, WEBP, HEIC, HEIF (max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p
            style={{
              color: "red",
              textAlign: "center",
              marginTop: "10px",
              marginBottom: "-10px",
              fontSize: "14px",
            }}
          >
            {error}
          </p>
        )}

        <PrimaryButton
          type="button"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Verify Account"}
        </PrimaryButton>
      </AuthCard>
    </AuthLayout>
  );
};

export default VerifyAccount;
