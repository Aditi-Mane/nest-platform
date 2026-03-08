import AuthLayout from '../../components/auth/AuthLayout.jsx'
import AuthCard from '../../components/auth/AuthCard.jsx'
import AuthHeader from '../../components/auth/AuthHeader.jsx'
import PrimaryButton from '../../components/auth/PrimaryButton.jsx'
import { useNavigate } from 'react-router-dom'

const RegistrationCompleted = () => {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title = "Registration Completed" subtitle = "Login to check your Verification Status."/>
        <PrimaryButton type="button" onClick={() => navigate("/auth/login", {replace: true})}>Check Status</PrimaryButton>
      </AuthCard>
    </AuthLayout>
  )
}

export default RegistrationCompleted
