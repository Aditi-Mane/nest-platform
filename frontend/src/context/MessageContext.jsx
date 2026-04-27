import { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/axios";
import { useSocket } from "./SocketContext";
import { useUser } from "./UserContext";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadMap, setUnreadMap] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const socket = useSocket();
  const { user } = useUser();

  

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

  //  REAL-TIME SOCKET UPDATE - Listen for unread updates on ALL pages
  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      if (import.meta.env.DEV) {
        console.log('MessageContext: Received unread_update:', data);
      }
      
      const count = isSeller
        ? data.unreadCountSeller ?? 0
        : data.unreadCountBuyer ?? 0;

      setUnreadMap((prev) => {
        const updated = { ...prev };
        updated[data.conversationId] = count;

        const total = Object.values(updated).reduce(
          (sum, val) => sum + val,
          0
        );

        setTotalUnread(total);
        
        if (import.meta.env.DEV) {
          console.log('MessageContext: Updated unread map:', updated, 'Total:', total);
        }

        return updated;
      });
    };

    socket.on("unread_update", handler);

    return () => socket.off("unread_update", handler);
  }, [socket, isSeller]);

  // LISTEN FOR ONLINE/OFFLINE EVENTS
  useEffect(() => {
    if (!socket) return;

    // Request initial list of online users
    socket.emit("request_online_users");

    const handleUserOnline = (data) => {
      if (import.meta.env.DEV) {
        console.log('User online:', data.userId);
      }
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    };

    const handleUserOffline = (data) => {
      if (import.meta.env.DEV) {
        console.log('User offline:', data.userId);
      }
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
    };

    const handleOnlineUsersList = (data) => {
      if (import.meta.env.DEV) {
        console.log('Received online users list:', data.userIds);
      }
      setOnlineUsers(new Set(data.userIds));
    };

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("online_users_list", handleOnlineUsersList);

    return () => {
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("online_users_list", handleOnlineUsersList);
    };
  }, [socket]);

  // MESSAGE NOTIFICATION SOUND
  useEffect(() => {
    if (!socket) return;

    const playNotificationSound = () => {
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3; // Set volume to 30% to not be too loud
        audio.play().catch(err => {
          // Silently fail if audio can't play (browser restrictions, etc.)
          if (import.meta.env.DEV) {
            console.log('Could not play notification sound:', err);
          }
        });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.log('Error creating audio:', error);
        }
      }
    };

    const handleMessageReceived = (message) => {
      if (import.meta.env.DEV) {
        console.log('Message received event:', message);
        console.log('Current user:', user);
      }

      // Get sender ID - handle both object and string formats
      const senderId = typeof message.senderId === 'object' 
        ? message.senderId._id 
        : message.senderId;
      
      const currentUserId = user?._id;

      // Only play sound for messages from other users, not our own messages
      if (senderId && currentUserId && senderId !== currentUserId) {
        // Don't play if document is hidden (user is in another tab/minimized)
        // But DO play even if on messages page - user should hear it
        const isDocumentVisible = !document.hidden;
        
        if (import.meta.env.DEV) {
          console.log('Checking sound conditions - senderId:', senderId, 'currentUserId:', currentUserId, 'visible:', isDocumentVisible);
        }

        if (isDocumentVisible) {
          playNotificationSound();
        }
      }
    };

    socket.on("receive_message", handleMessageReceived);

    return () => {
      socket.off("receive_message", handleMessageReceived);
    };
  }, [socket, user]);

  return (
    <MessageContext.Provider
      value={{ totalUnread, unreadMap, setTotalUnread, fetchUnread, onlineUsers }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);