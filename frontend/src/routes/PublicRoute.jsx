import { Navigate } from "react-router-dom"
import { isAuthenticated } from "../../utils/getToken.js"
const PublicRoute = ({children}) => {
  if(isAuthenticated()){
    return <Navigate to="/marketplace" replace/> //replace prevents user from navigating to prev page
  }
  return children
}

export default PublicRoute
