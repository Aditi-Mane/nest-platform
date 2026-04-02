import { Navigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";

const getFallbackPath = (user, allowedRole) => {
  if (!user?.activeRole) {
    return "/choose-role";
  }

  if (allowedRole === "seller") {
    return user.activeRole === "buyer"
      ? "/marketplace/buyer"
      : user.sellerStatus === "active"
        ? "/marketplace/seller/dashboard"
        : "/marketplace/seller/setup";
  }

  if (allowedRole === "buyer") {
    return user.activeRole === "seller"
      ? user.sellerStatus === "active"
        ? "/marketplace/seller/dashboard"
        : "/marketplace/seller/setup"
      : "/marketplace/buyer";
  }

  return "/resolve";
};

const RoleProtectedRoute = ({ allowedRole, children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.activeRole !== allowedRole) {
    return <Navigate to={getFallbackPath(user, allowedRole)} replace />;
  }

  if (allowedRole === "seller" && user.sellerStatus !== "active") {
    return <Navigate to="/marketplace/seller/setup" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
