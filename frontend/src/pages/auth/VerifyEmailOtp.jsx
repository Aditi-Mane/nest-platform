import AuthLayout from '../../components/auth/AuthLayout.jsx'
import AuthCard from '../../components/auth/AuthCard.jsx'
import AuthHeader from '../../components/auth/AuthHeader.jsx'
import PrimaryButton from '../../components/auth/PrimaryButton.jsx'
import InputField from '../../components/auth/InputField.jsx'
import { GrSecure } from "react-icons/gr";
import { useState } from 'react'
import api from '../../api/axios.js'
import { useLocation, useNavigate } from 'react-router-dom'

const VerifyEmailOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const email = location.state?.email || localStorage.getItem("signupEmail");

  const handleVerifyEmailOtp = async () =>{
    try {
      setError("");
      setLoading(true);

      const res = await api.post(
        "/auth/verify-email-otp",
        {
          email,
          otp
        }
      )

      if (!res?.data?.userId) {
        setError("Verification failed");
        return;
      }
      localStorage.removeItem("signupEmail");

      localStorage.setItem("tempUserId", res.data.userId);

      navigate("/auth/verify-account", {
        state: {userId: res?.data?.userId}
      });

    } catch (error) {
      console.log("FULL ERROR:", error);
  console.log("BACKEND RESPONSE:", error?.response);
  console.log("BACKEND DATA:", error?.response?.data);
      setError(error?.response?.data?.message || "OTP verification failed")
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title = "Verify Email" subtitle = "Please enter the OTP sent to your registered email."/>

        <InputField icon={GrSecure} type="text" placeholder="Enter OTP" value={otp} onChange={(e) => {setOtp(e.target.value)}}/>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginTop: "10px",  marginBottom: "-10px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <PrimaryButton type="button" disabled={loading} onClick={handleVerifyEmailOtp}>{loading ? "Verifying OTP..." : "Continue"}</PrimaryButton>
      </AuthCard>
    </AuthLayout>
  )
}

export default VerifyEmailOtp
