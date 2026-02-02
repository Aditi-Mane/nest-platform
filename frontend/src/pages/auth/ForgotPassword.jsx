import { MdEmail } from "react-icons/md"
import AuthLayout from "../../components/auth/AuthLayout.jsx"
import AuthCard from "../../components/auth/AuthCard.jsx"
import AuthHeader from "../../components/auth/AuthHeader.jsx"
import InputField from "../../components/auth/InputField.jsx"
import PrimaryButton from "../../components/auth/PrimaryButton.jsx"

const ForgotPassword = () => {
  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title = "Forgot Password" subtitle = "Enter your email address to receive an OTP on your email."/>
        <InputField icon={MdEmail} type="email" placeholder="Email address"/>
        <PrimaryButton>Continue</PrimaryButton>
      </AuthCard>
    </AuthLayout>
  )
}

export default ForgotPassword
