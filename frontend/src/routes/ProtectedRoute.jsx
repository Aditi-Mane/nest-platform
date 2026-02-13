import { isAuthenticated } from "../../utils/getToken.js"
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({children}) => {
  if(!isAuthenticated()){
    return <Navigate to="/auth/login" replace/>
  }
  return children;
}

export default ProtectedRoute;
