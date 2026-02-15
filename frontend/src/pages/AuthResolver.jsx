import { useNavigate } from "react-router-dom";
import useUserResolver from "../../hooks/useUserResolver.jsx"
import { useEffect } from "react";

const AuthResolver = () => {
  const {loading, destination} = useUserResolver();
  const navigate = useNavigate();

  useEffect(() => {
    if(!loading && destination){
      navigate(destination, {replace: true});
    }
  }, [loading, destination, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return null;
}

export default AuthResolver
