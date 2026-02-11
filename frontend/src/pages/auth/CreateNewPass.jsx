import AuthLayout from "../../components/auth/AuthLayout.jsx";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import InputField from "../../components/auth/InputField.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { MdLock } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import api from "../../api/axios.js";

const CreateNewPass = () => {
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const email = location.state?.email;

  const handleResetPass = async () =>{
    try {
      setError("");
      setLoading(true);

      await api.post(
        "/auth/create-new-pass",
        {
          email,
          pass,
          confirmPass
        }
      )
      navigate("/marketplace");
    } catch (error) {
      setError(error?.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title = "Create new password" subtitle = "Set a new and strong password."/>
        <InputField icon={MdLock} type={showPassword ? "text" : "password"} placeholder="Password" value={pass} onChange={(e)=>{setPass(e.target.value)}}>
          <button onClick = {() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEye/> : <FaEyeSlash/>}
          </button>
        </InputField>
        <InputField icon={MdLock} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={confirmPass} onChange={(e)=>{setConfirmPass(e.target.value)}}>
          <button onClick = {() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEye/> : <FaEyeSlash/>}
          </button>
        </InputField>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginTop: "10px",  marginBottom: "-10px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <PrimaryButton type="button" onClick={handleResetPass}>Continue</PrimaryButton>
      </AuthCard>
    </AuthLayout>
  )
}

export default CreateNewPass
