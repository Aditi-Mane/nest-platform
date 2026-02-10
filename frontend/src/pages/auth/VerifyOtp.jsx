import AuthLayout from '../../components/auth/AuthLayout.jsx'
import AuthCard from '../../components/auth/AuthCard.jsx'
import AuthHeader from '../../components/auth/AuthHeader.jsx'
import PrimaryButton from '../../components/auth/PrimaryButton.jsx'
import InputField from '../../components/auth/InputField.jsx'
import { GrSecure } from "react-icons/gr";

const VerifyOtp = () => {
  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title = "OTP verification" subtitle = "Please enter the OTP sent to your registered email."/>

        <InputField icon={GrSecure} type="text" placeholder="Enter OTP"/>

        <PrimaryButton>Verify OTP</PrimaryButton>
      </AuthCard>
    </AuthLayout>
  )
}

export default VerifyOtp
