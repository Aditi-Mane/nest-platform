import AuthLayout from "../../components/auth/AuthLayout.jsx";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { clearStoredToken } from "../../utils/authStorage.js";

import { FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const VerificationStatus = () => {

  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get("/users/me");
      setStatus(res.data.verificationStatus);
    } catch {
      navigate("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  //loading UI
  if (loading) {
    return (
      <AuthLayout>
        <AuthCard>
          <p className="text-center text-muted">Checking verification status...</p>
        </AuthCard>
      </AuthLayout>
    );
  }

  //config Map
  const config = {
    under_review: {
      icon: <FaClock className="text-secondary text-4xl" />,
      title: "Verification Pending",
      subtitle: "Our team is reviewing your documents.",
      description:
        "We are verifying your details. You will gain full access once approved.",
      buttonText: "Back to Login",
      buttonAction: () => {
        clearStoredToken();
        navigate("/auth/login");
      }
    },

    approved: {
      icon: <FaCheckCircle className="text-secondary text-4xl" />,
      title: "Verification Approved",
      subtitle: "You now have full access to Nest.",
      description:
        "You can now continue to set up your experience and access the marketplace.",
      buttonText: "Continue",
      buttonAction: () => navigate("/resolve")
    },

    rejected: {
      icon: <FaTimesCircle className="text-secondary text-4xl" />,
      title: "Verification Rejected",
      subtitle: "Your submission could not be verified.",
      description:
        "Please check your details and try submitting again or contact support.",
      buttonText: "Back to Login",
      buttonAction: () => {
        clearStoredToken();
        navigate("/auth/login");
      }
    }
  };

  const normalizedStatus = status?.toLowerCase();
  const current = config[normalizedStatus] || config.under_review;

  return (
    <AuthLayout>
      <AuthCard>

        <div className="flex justify-center mb-4">
          {current.icon}
        </div>

        <AuthHeader
          title={current.title}
          subtitle={current.subtitle}
        />

        <p className="text-sm text-text text-center mt-5 leading-relaxed">
          {current.description}
        </p>
        <div>
          <PrimaryButton
            type="button"
            onClick={current.buttonAction}
          >
            {current.buttonText}
          </PrimaryButton>
        </div>

      </AuthCard>
    </AuthLayout>
  );
};

export default VerificationStatus;
