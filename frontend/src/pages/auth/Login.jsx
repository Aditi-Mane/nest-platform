import { useState } from "react";
import api from "../../api/axios.js";
import { MdEmail, MdLock } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout.jsx";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import AuthFooterLink from "../../components/auth/AuthFooterLink.jsx";
import InputField from "../../components/auth/InputField.jsx";
import RememberForgotRow from "../../components/auth/RememberForgotRow.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await api.post(
        "/auth/login",
        {
          email,
          password
        }
      );

      //store JWT Token
      localStorage.setItem("token", res.data.token);

      //navigate to marketplace
      navigate("/choose-role");

    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Log in"
          subtitle="Enter your email and password to securely access your account."
        />

        {/* EMAIL */}
        <InputField
          icon={MdEmail}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <InputField
          icon={MdLock}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        >
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </InputField>

        <RememberForgotRow onForgot={() => navigate("/auth/forgot-password")} />

        {/* ERROR */}
        {error && (
          <p style={{ color: "red", textAlign: "center", marginTop: "10px",  marginBottom: "-10px", fontSize: "14px" }}>
            {error}
          </p>
        )}
        
        {/* LOGIN BUTTON */}
        <PrimaryButton
          type="button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </PrimaryButton>

        <AuthFooterLink
          text="Don’t have an account?"
          linkText="Sign up"
          onClick={() => navigate("/auth/signup")}
        />
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
