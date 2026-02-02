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

const SignUp = () => {
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

        <InputField icon={IoPerson} type="text" placeholder="Name"/>
        <InputField icon={MdEmail} type="email" placeholder="Email address"/>
        <InputField icon={MdLock} type={showPassword ? "text" : "password"} placeholder="Password">
          <button onClick = {() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEye/> : <FaEyeSlash/>}
          </button>
        </InputField>
        <InputField icon={MdLock} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password">
          <button onClick = {() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEye/> : <FaEyeSlash/>}
          </button>
        </InputField>

        <PrimaryButton onClick = {() => navigate("/auth/verify-account")}>Sign Up</PrimaryButton>

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
