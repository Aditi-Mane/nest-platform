import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUser } from "@/context/UserContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    // Use the same base URL as the API, but remove /api suffix for socket connection
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const socketUrl = apiUrl.replace("/api", "");
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id, "URL:", socketUrl);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error, "URL:", socketUrl);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // ✅ JOIN USER ROOM IMMEDIATELY AFTER SOCKET CONNECTION AND WHEN USER CHANGES
  useEffect(() => {
    if (!socket || !user?._id) return;

    const joinUserRoom = () => {
      if (socket.connected) {
        console.log('SocketContext: User room join - emitting for user:', user._id);
        socket.emit("join_user_room", user._id);
        
        // After joining, request online users to pick up everyone
        setTimeout(() => {
          socket.emit("request_online_users");
        }, 200);
      } else {
        // If not connected yet, wait for connection
        socket.once("connect", () => {
          console.log('SocketContext: Socket now connected, joining user room for:', user._id);
          socket.emit("join_user_room", user._id);
          
          // After joining, request online users
          setTimeout(() => {
            socket.emit("request_online_users");
          }, 200);
        });
      }
    };

    joinUserRoom();
  }, [socket, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);

  if (!socket) {
    console.warn("Socket not initialized yet");
  }

  return socket;
};