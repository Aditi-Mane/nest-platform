import { MdEmail } from "react-icons/md"
import AuthLayout from "../../components/auth/AuthLayout.jsx"
import AuthCard from "../../components/auth/AuthCard.jsx"
import AuthHeader from "../../components/auth/AuthHeader.jsx"
import InputField from "../../components/auth/InputField.jsx"
import PrimaryButton from "../../components/auth/PrimaryButton.jsx"
import { useState } from "react"
import api from "../../api/axios.js"
import { useNavigate } from "react-router-dom"

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPass = async () =>{
    try {
      setError("");
      setLoading(true);

      await api.post(
        "/auth/forgot-password",
        {
          email
        }
      )
      navigate("/auth/verify-otp", {
        state: {email}
      })
      
    } catch (error) {
      setError(error?.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title = "Forgot Password" subtitle = "Enter your email address to receive an OTP."/>

        <InputField icon={MdEmail} type="email" placeholder="Email address" value={email} onChange={(e)=>{setEmail(e.target.value)}}/>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginTop: "10px",  marginBottom: "-10px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <PrimaryButton
          type="button"
          onClick={handleForgotPass}
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Continue"}
        </PrimaryButton>
      </AuthCard>
    </AuthLayout>
  )
}

export default ForgotPassword
