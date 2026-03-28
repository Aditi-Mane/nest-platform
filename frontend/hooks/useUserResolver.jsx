import { useState, useEffect } from "react";
import api from "../src/api/axios.js";

const useUserResolver = () => {
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    resolveUser();
  }, []);

  const resolveUser = async () => {
    try {
      const res = await api.get("/users/me");
      const user = res.data;

      if (user.verificationStatus === "pending_email") {
        return setDestination("/auth/verify-email-otp");
      }

      if (user.verificationStatus === "email_verified") {
        return setDestination("/auth/verify-account");
      }

      if (["under_review", "rejected"].includes(user.verificationStatus)) {
        return setDestination("/auth/verification-status");
      }

      if (user.verificationStatus !== "approved") {
        return setDestination("/auth/verification-status");
      }

      if (!user.activeRole) {
        return setDestination("/choose-role");
      }

      if (user.activeRole === "seller") {
        return setDestination(
          user.sellerStatus === "active"
            ? "/marketplace/seller"
            : "/marketplace/seller/setup"
        );
      }

      setDestination("/marketplace/buyer");
    } catch {
      setDestination("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  return { loading, destination };
};

export default useUserResolver;