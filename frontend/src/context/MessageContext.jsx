import { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/axios";
import { useSocket } from "./SocketContext";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadMap, setUnreadMap] = useState({});
  const socket = useSocket();

  //  detect role ONCE
  const isSeller = window.location.pathname.includes("seller");

  // INITIAL FETCH
  const fetchUnread = async () => {
    try {
      const res = await api.get(
        isSeller ? "/conversations/seller" : "/conversations/buyer"
      );

      const map = {};
      let total = 0;
      const conversations = res.data?.data || [];
      conversations.forEach((item) => {
        const count = isSeller
          ? item.unreadCountSeller || 0
          : item.unreadCountBuyer || 0;

        map[item._id] = count;
        total += count;
      });

      setUnreadMap(map);
      setTotalUnread(total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUnread();
  }, []);

  //  REAL-TIME SOCKET UPDATE
  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      const count = isSeller
        ? data.unreadCountSeller ?? 0
        : data.unreadCountBuyer ?? 0;

      setUnreadMap((prev) => {
        const updated = {
          ...prev,
          [data.conversationId]: count,
        };

        const total = Object.values(updated).reduce(
          (sum, val) => sum + val,
          0
        );

        setTotalUnread(total);

        return updated;
      });
    };

    socket.on("unread_update", handler);

    return () => socket.off("unread_update", handler);
  }, [socket, isSeller]);

  return (
    <MessageContext.Provider
      value={{ totalUnread, unreadMap, setTotalUnread, fetchUnread }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);