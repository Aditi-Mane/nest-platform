import { IoPerson } from "react-icons/io5";
import { useState } from "react"
import { MdEmail, MdLock } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import AuthFooterLink from "../../components/auth/AuthFooterLink.jsx";
import InputField from "../../components/auth/InputField.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import api from "../../api/axios.js";
const SignUp = () => {

  //add state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () =>{
    try {
      setError("");

      if( password !== confirmPassword){
        setError("Passwords do not match")
        return;
      }

      setLoading(true);

      //axios sends post request to backend, to which response is sent
      const res = await api.post(
        "/auth/signup",
        {
          name,
          email,
          password
        }
      );

      if (!res?.data?.email) {
        setError("Signup failed");
        return;
      }
      localStorage.setItem("signupEmail", res.data.email);

      // Navigate only if backend success
      navigate("/auth/verify-email-otp", {
        replace: true,
        state: {email: res?.data?.email}
      })
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title = "Sign Up"
          subtitle = "Create a new account to get started and enjoy access to our features."
        />

        {/* adding controllable inputs */}
        <InputField icon={IoPerson} type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}/>
        <InputField icon={MdEmail} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}/>
        <InputField icon={MdLock} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}>
          <button onClick = {() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEye/> : <FaEyeSlash/>}
          </button>
        </InputField>
        <InputField icon={MdLock} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}>
          <button onClick = {() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEye/> : <FaEyeSlash/>}
          </button>
        </InputField>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginTop: "10px",  marginBottom: "-10px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <PrimaryButton onClick = {handleSignup} disabled={loading}>{loading ? "Sending OTP..." : "Sign Up"}</PrimaryButton>

        <AuthFooterLink
          text = "Already have an account?"
          linkText = "Log in"
          onClick = {() => navigate("/auth/login")}
        />

      </AuthCard>
    </AuthLayout>
  )
}

export default SignUp
