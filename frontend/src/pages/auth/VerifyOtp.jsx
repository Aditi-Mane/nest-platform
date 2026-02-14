import AuthLayout from '../../components/auth/AuthLayout.jsx'
import AuthCard from '../../components/auth/AuthCard.jsx'
import AuthHeader from '../../components/auth/AuthHeader.jsx'
import PrimaryButton from '../../components/auth/PrimaryButton.jsx'
import InputField from '../../components/auth/InputField.jsx'
import { GrSecure } from "react-icons/gr";
import { useState } from 'react'
import api from '../../api/axios.js'
import { useLocation, useNavigate } from 'react-router-dom'

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const email = location.state?.email;

  const handleVerifyOtp = async () =>{
    try {
      setError("");
      setLoading(true);

      await api.post(
        "/auth/verify-otp",
        {
          email,
          otp
        }
      )
      navigate("/auth/create-new-pass", {
        state: {email}
      });

    } catch (error) {
      setError(error?.response?.data?.message || "OTP verification failed")
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title = "OTP verification" subtitle = "Please enter the OTP sent to your registered email."/>

        <InputField icon={GrSecure} type="text" placeholder="Enter OTP" value={otp} onChange={(e) => {setOtp(e.target.value)}}/>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginTop: "10px",  marginBottom: "-10px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <PrimaryButton type="button" disabled={loading} onClick={handleVerifyOtp}>{loading ? "Verifying OTP..." : "Continue"}</PrimaryButton>
      </AuthCard>
    </AuthLayout>
  )
}

export default VerifyOtp
