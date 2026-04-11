import { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/axios";
import {
  clearStoredToken,
  getStoredToken,
  subscribeToAuthChanges,
} from "@/utils/authStorage";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const token = getStoredToken();

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (error) {
        console.error("Failed to load user", error);
        setUser(null);
        clearStoredToken();
      } finally {
        setLoading(false);
      }
    }

    fetchUser();

    const unsubscribe = subscribeToAuthChanges(fetchUser);
    return unsubscribe;
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
