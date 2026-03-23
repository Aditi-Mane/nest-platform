import AuthCard from "../../components/auth/AuthCard.jsx"
import AuthHeader from "../../components/auth/AuthHeader.jsx"
import AuthLayout from "../../components/auth/AuthLayout.jsx"
import InputField from "../../components/auth/InputField.jsx"
import { FaIdCard } from "react-icons/fa"
import { FiUpload } from "react-icons/fi";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx"
import { useState } from "react"
import api from "../../api/axios.js"
import { useNavigate } from "react-router-dom"

const VerifyAccount = () => {
  const [prn, setPrn] = useState("");
  const [idImg, setIdImg] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdImg(file);
    }
  };

  const handleVerify = async () => {
    try {
      setError("");
      setLoading(true);

      const formData = new FormData();

      formData.append("collegeId", prn);
      formData.append("idCard", idImg);

      await api.post(
        "/auth/verify-account",
        formData
      );
              
      navigate("/auth/registration", {replace: true});
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
          title = "Verify Account"
          subtitle = "Enter additional details to get verified as a student of Sinhgad Institutes."
        />

        <InputField icon={FaIdCard} type="text" placeholder="PRN number" value={prn} onChange={(e) => setPrn(e.target.value)}/>

        <div className="mt-4">
          <label className="block text-sm font-medium text-text mb-3 text-center">
            {idImg ? "College ID Uploaded ✅" : "Upload College ID Card"}
          </label>

          <div className="relative bg-card border-2 border-dashed border-primary rounded-xl px-4 py-6 text-center cursor-pointer hover:bg-background transition">
            <input
              type="file"
              accept="image/jpg, image/png, image/jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {idImg ? (
              <div className="flex flex-col items-center justify-center">
                <img
                  src={URL.createObjectURL(idImg)}
                  alt="Preview"
                  className="max-h-48 object-contain rounded-lg"
                />

                <p className="text-xs text-green-500 mt-2">
                  {idImg.name}
                </p>
              </div>
            ) : (

            <div className="flex flex-col items-center justify-center">
              <FiUpload className="text-text text-2xl mb-2" />

              <p className="text-sm text-text">
                Click to upload or drag & drop
              </p>

              <p className="text-xs text-muted mt-1">
                PNG, JPG, JPEG (max 5MB)
              </p>
            </div>
            )}
          </div>
        </div>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginTop: "10px",  marginBottom: "-10px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <PrimaryButton type = "button" onClick={handleVerify} disabled={loading}>{loading ? "Submitting..." : "Verify Account"}</PrimaryButton>

      </AuthCard>
    </AuthLayout>
  )
}

export default VerifyAccount
