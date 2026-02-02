import AuthLayout from "../../components/auth/AuthLayout.jsx";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import InputField from "../../components/auth/InputField.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { MdLock } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

const CreateNewPass = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title = "Create new password" subtitle = "Set a new and strong password."/>
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
        <PrimaryButton>Continue</PrimaryButton>
      </AuthCard>
    </AuthLayout>
  )
}

export default CreateNewPass
