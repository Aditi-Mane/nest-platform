import { Routes, Route } from "react-router-dom"
import Login from "./auth/Login.jsx"
import SignUp from "./auth/SignUp.jsx"
import ForgotPassword from "./auth/ForgotPassword.jsx"
import VerifyOtp from "./auth/VerifyOtp.jsx"
import CreateNewPass from "./auth/CreateNewPass.jsx"
import VerifyAccount from "./auth/VerifyAccount.jsx"

const AuthPage = () => {
  return (
    <Routes>
      {/* Default route: /auth → Login */}
      <Route index element={<Login />} />
      
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<SignUp/>} />
      <Route path="verify-account" element={<VerifyAccount/>} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="verify-otp" element={<VerifyOtp/>} />
      <Route path="create-new-pass" element={<CreateNewPass/>} />
    </Routes>
  )
}

export default AuthPage
