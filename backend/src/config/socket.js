import { Server } from "socket.io";

let io;

export const initSocket = (server) => {

  //attaches socket to server
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://main.d2s3j9j85nw93c.amplifyapp.com",
    "https://www.nestplatform.website",
    "https://nestplatform.website"
  ];

  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(null, false);
        }
      },
      methods: ["GET", "POST", "PATCH"],
    },
  });

  //a listener that runs every time a new client connects
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

  socket.on("join_user_room", (userId) => {
    console.log(`User ${socket.id} joining user room: ${userId}`);
    socket.userId = userId; // Store for disconnect handler
    socket.join(userId);
    
    // Broadcast that user is now online
    io.emit("user_online", { userId });
  });

  socket.on("request_online_users", () => {
    // Send back all currently online users
    const onlineUserIds = Array.from(io.sockets.sockets.values())
      .filter(s => s.userId)
      .map(s => s.userId);
    
    socket.emit("online_users_list", { userIds: onlineUserIds });
  });

  socket.on("join_conversation", (conversationId) => {
      console.log(`User ${socket.id} joining conversation: ${conversationId}`);
      socket.join(conversationId);
    });

    socket.on("join_venture_room", (ventureId) => {
      if (!ventureId) return;
      socket.join(`venture:${ventureId}`);
    });

    socket.on("leave_venture_room", (ventureId) => {
      if (!ventureId) return;
      socket.leave(`venture:${ventureId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      
      // Get the user ID from the socket data if we stored it
      if (socket.userId) {
        io.emit("user_offline", { userId: socket.userId });
      }
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
