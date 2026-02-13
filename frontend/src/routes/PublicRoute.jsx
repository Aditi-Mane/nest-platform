import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../../utils/getToken.js";
import api from "../api/axios.js";

const PublicRoute = ({ children }) => {

  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      const res = await api.get("/users/me");
      const user = res.data;

      if (user.activeRole === "seller") {
        setRedirect("/marketplace/seller");
      } else {
        setRedirect("/marketplace/buyer");
      }

    } catch {
      // token invalid → treat as logged out
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default PublicRoute;
