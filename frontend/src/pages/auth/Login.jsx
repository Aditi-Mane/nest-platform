import { useState } from "react"
import { MdEmail, MdLock } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import AuthFooterLink from "../../components/auth/AuthFooterLink.jsx";
import InputField from "../../components/auth/InputField.jsx";
import RememberForgotRow from "../../components/auth/RememberForgotRow.jsx"
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Log in"
          subtitle="Enter your email and password to securely access your account."
        />

        <InputField icon={MdEmail} type="email" placeholder="Email address" />

        <InputField
          icon={MdLock}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
        >
          <button onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </InputField>

        <RememberForgotRow onForgot={() => navigate("/auth/forgot-password")} />

        <PrimaryButton type = "submit">Login</PrimaryButton>

        <AuthFooterLink
          text="Don’t have an account?"
          linkText="Sign up"
          onClick={() => navigate("/auth/signup")}
        />
      </AuthCard>
    </AuthLayout>
  )
}

export default Login
