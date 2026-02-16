import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/getToken.js";

const PublicRoute = ({ children }) => {

  if (isAuthenticated()) {
    return <Navigate to="/resolve" replace />;
  }

  return children;
};

export default PublicRoute;
