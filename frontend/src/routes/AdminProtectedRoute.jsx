import { Navigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";

const AdminProtectedRoute = ({ children }) => {
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

  if (!user.availableRoles?.includes("admin")) {
    return <Navigate to="/resolve" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
