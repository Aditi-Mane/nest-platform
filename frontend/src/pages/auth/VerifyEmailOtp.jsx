import AuthLayout from '../../components/auth/AuthLayout.jsx'
import AuthCard from '../../components/auth/AuthCard.jsx'
import AuthHeader from '../../components/auth/AuthHeader.jsx'
import PrimaryButton from '../../components/auth/PrimaryButton.jsx'
import InputField from '../../components/auth/InputField.jsx'
import { GrSecure } from "react-icons/gr";
import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import { useLocation, useNavigate } from 'react-router-dom'
import { setStoredToken } from "../../utils/authStorage.js";

const VerifyEmailOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);

  // ✅ EMAIL MUST BE STATE
  const [email, setEmail] = useState(
    location.state?.email ||
    localStorage.getItem("signupEmail")
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerifyEmailOtp = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await api.post("/auth/verify-email-otp", {
        email,
        otp
      });

      const token = res?.data?.token;

      if (!token) {
        setError("Verification failed");
        return;
      }

      localStorage.removeItem("signupEmail");
      setStoredToken(token);

      navigate("/resolve", { replace: true });

    } catch (error) {
      setError(error?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError("");
      await api.post("/auth/resend-email-otp", { email });
      setCooldown(30);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleChangeEmail = async () => {
  try {
    if (!newEmail) {
      setError("Email is required");
      return;
    }

    if (!newEmail.includes("@") || !newEmail.includes(".")) {
      setError("Enter a valid email");
      return;
    }

    setUpdatingEmail(true);
    setError("");

    const res = await api.post(
      "/auth/change-email-before-verification",
      {
        email,
        newEmail
      }
    );

    setEmail(res.data.email);
    localStorage.setItem("signupEmail", res.data.email);

    setIsEditingEmail(false);
    setNewEmail("");
    setCooldown(30);

  } catch (error) {
    setError(error?.response?.data?.message || "Failed to change email");
  } finally {
    setUpdatingEmail(false);
  }
};

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Verify Email"
          subtitle={`Enter the OTP sent to ${email}`}
        />

        <InputField
          icon={GrSecure}
          type="text"
          placeholder="Enter 6 digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        {/* Action Row */}
        <div className="flex justify-between text-sm mt-2">
          {cooldown > 0 ? (
            <span className="text-muted">
              Resend in {cooldown}s
            </span>
          ) : (
            <span
              className="text-primary cursor-pointer font-medium"
              onClick={handleResendOtp}
            >
              Resend OTP
            </span>
          )}

          <span
            className="text-primary cursor-pointer font-medium"
            onClick={() => setIsEditingEmail(prev => !prev)}
          >
            Change Email
          </span>
        </div>

        {/* Inline Email Edit */}
        {isEditingEmail && (
          <div className="mt-3 space-y-3">

            <InputField
              type="email"
              placeholder="Enter new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />

            <div className="flex justify-center gap-4 text-sm">

              <span
                className="cursor-pointer text-gray-500"
                onClick={() => {
                  if (!updatingEmail) {
                    setIsEditingEmail(false);
                    setNewEmail("");
                  }
                }}
              >
                Cancel
              </span>

              <span
                className={`cursor-pointer font-medium ${
                  updatingEmail ? "text-muted" : "text-primary"
                }`}
                onClick={!updatingEmail ? handleChangeEmail : undefined}
              >
                {updatingEmail ? "Updating..." : "Update Email"}
              </span>

            </div>
          </div>
        )}

        {error && (
          <p
            style={{
              color: "red",
              textAlign: "center",
              marginTop: "10px",
              fontSize: "14px"
            }}
          >
            {error}
          </p>
        )}

        <PrimaryButton
          type="button"
          disabled={loading}
          onClick={handleVerifyEmailOtp}
        >
          {loading ? "Verifying OTP..." : "Continue"}
        </PrimaryButton>

      </AuthCard>
    </AuthLayout>
  );
};

export default VerifyEmailOtp;
