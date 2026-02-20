import { useState, useEffect } from "react"
import api from "../src/api/axios.js";

const useUserResolver = () => {
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    resolveUser();
  }, [])
  
  const resolveUser = async () =>{

    try {
      const res = await api.get("/users/me");

      const user = res.data;

      if(user.verificationStatus !== "approved"){
        setDestination("/auth/verification-status");
        return;
      }

      if (!user.activeRole) {
        setDestination("/choose-role");
        return;
      }

      if (user.activeRole === "seller") {
        if(user.sellerStatus === "active"){
          setDestination("/marketplace/seller");
        } else {
          setDestination("/marketplace/seller/setup");
        }
      } else {
        setDestination("/marketplace/buyer");
      }
    } catch (error) {
      setDestination("/auth/login")
    } finally {
      setLoading(false);
    }
  }

  return {loading, destination};
}

export default useUserResolver
