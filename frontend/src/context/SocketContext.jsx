import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUser } from "@/context/UserContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const socketInstance = io("http://localhost:5000", {
      withCredentials: true,
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // ✅ JOIN USER ROOM (FIXED)
  useEffect(() => {
    if (!socket || !user?._id) return;

    if (socket.connected) {
      socket.emit("join_user_room", user._id);
    } else {
      socket.once("connect", () => {
        socket.emit("join_user_room", user._id);
      });
    }
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