import AuthLayout from "../../components/auth/AuthLayout.jsx";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { useNavigate } from "react-router-dom";
import { FaClock } from "react-icons/fa";

const VerificationPending = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <AuthCard>

        <div className="flex justify-center mb-4">
          <FaClock className="text-muted text-4xl" />
        </div>

        <AuthHeader
          title="Verification Status: Pending"
          subtitle="Your details are under review."
        />

        <p className="text-sm text-text text-center mt-5 leading-relaxed">
          This usually takes a few hours. You will be able to access the full platform once approved.
        </p>


        <div>
          <PrimaryButton
            type="button"
            onClick={() => navigate("/auth/login")}
          >
            Back to Login
          </PrimaryButton>
        </div>

      </AuthCard>
    </AuthLayout>
  );
};

export default VerificationPending;
