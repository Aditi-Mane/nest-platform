import React, { useState } from "react";
import { FiShield, FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios.js";

const SellerVerifyOtp = () => {
  const { orderId } = useParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError("");

      await api.post(
        `/seller/orders/${orderId}`,
        {
          otp
        }
      )

      navigate("/marketplace/seller/orders");
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background h-full flex items-center justify-center p-6 relative">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-muted hover:text-primary transition text-md font-medium"
      >
        <FiArrowLeft size={20} />
        Back
      </button>

      <div className="bg-card border border-border rounded-[22px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] w-full max-w-md p-8">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center text-primary text-2xl">
            <FiShield />
          </div>

          <h2 className="text-2xl font-semibold mt-4">
            Verify Delivery OTP
          </h2>

          <p className="text-muted text-sm mt-2 text-center">
            Enter the 6-digit OTP provided by the buyer to complete the order.
          </p>
        </div>

        {/* OTP INPUT */}
        <div className="mt-6">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setOtp(value);
            }}
            placeholder="Enter OTP"
            className="w-full border border-border bg-background rounded-lg px-4 py-3 text-center tracking-[8px] text-lg font-medium focus:outline-none focus:border-primary transition"
          />
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">
            {error}
          </p>
        )}

        {/* VERIFY BUTTON */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

      </div>
    </div>
  );
};

export default SellerVerifyOtp;