import { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/axios";
import { useSocket } from "./SocketContext";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [totalUnread, setTotalUnread] = useState(0);
  const socket = useSocket();

  
  const fetchUnread = async () => {
    try {
      const res = await api.get("/conversations/buyer");

      const total = res.data.conversations.reduce(
        (sum, item) => sum + (item.unreadCountBuyer || 0),
        0
      );

      setTotalUnread(total);
    } catch (err) {
      console.error(err);
    }
  };

  // INITIAL LOAD (THIS FIXES YOUR ISSUE)
  useEffect(() => {
    fetchUnread();
  }, []);

  // SOCKET REAL-TIME
  useEffect(() => {
    if (!socket) return;

    socket.on("unread_update", fetchUnread);

    return () => socket.off("unread_update", fetchUnread);
  }, [socket]);

  return (
    <MessageContext.Provider value={{ totalUnread, setTotalUnread, fetchUnread }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);