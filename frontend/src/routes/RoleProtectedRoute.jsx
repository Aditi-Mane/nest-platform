import { Navigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";

const getFallbackPath = (user, allowedRoles) => {
  const normalizedRoles = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];

  if (!user?.activeRole) {
    return "/choose-role";
  }

  if (normalizedRoles.includes("seller") && !normalizedRoles.includes("buyer")) {
    return user.activeRole === "buyer"
      ? "/marketplace/buyer"
      : user.sellerStatus === "active"
        ? "/marketplace/seller/dashboard"
        : "/marketplace/seller/setup";
  }

  if (normalizedRoles.includes("buyer") && !normalizedRoles.includes("seller")) {
    return user.activeRole === "seller"
      ? user.sellerStatus === "active"
        ? "/marketplace/seller/dashboard"
        : "/marketplace/seller/setup"
      : "/marketplace/buyer";
  }

  return "/resolve";
};

const RoleProtectedRoute = ({ allowedRole, allowedRoles, children }) => {
  const { user, loading } = useUser();
  const permittedRoles = allowedRoles || allowedRole;
  const normalizedRoles = Array.isArray(permittedRoles)
    ? permittedRoles
    : [permittedRoles];

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

  if (!normalizedRoles.includes(user.activeRole)) {
    return <Navigate to={getFallbackPath(user, permittedRoles)} replace />;
  }

  if (normalizedRoles.includes("seller") && user.activeRole === "seller" && user.sellerStatus !== "active") {
    return <Navigate to="/marketplace/seller/setup" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
