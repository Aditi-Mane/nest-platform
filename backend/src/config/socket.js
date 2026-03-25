import { Server } from "socket.io";

let io;

export const initSocket = (server) => {

  //attaches socket to server
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // FRONTEND URL
      methods: ["GET", "POST", "PATCH"],
      credentials: true,
    },
  });

  //a listener that runs every time a new client connects
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);


  socket.on("join_user_room", (userId) => {
    socket.join(userId);
  });

  socket.on("join_conversation", (conversationId) => {
      console.log("JOIN EVENT RECEIVED:", conversationId);
      socket.join(conversationId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

//gives controllers access to the Socket.IO server instance, which manages all active socket connections and rooms
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};