import { Server } from "socket.io";

let io;

// Track user connections: userId -> Set of socket IDs
const userConnections = new Map();

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
      credentials: true,
    },
  });

  //a listener that runs every time a new client connects
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

  socket.on("join_user_room", (userId) => {
    console.log(`User ${socket.id} joining user room: ${userId}`);
    socket.userId = userId; // Store for disconnect handler
    
    // Track this connection
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId).add(socket.id);
    
    socket.join(userId);
    
    // Only broadcast online if this is the first connection for this user
    if (userConnections.get(userId).size === 1) {
      io.emit("user_online", { userId });
    }
  });

  socket.on("request_online_users", () => {
    // Send back all currently online users (users with at least one active connection)
    const onlineUserIds = Array.from(userConnections.keys()).filter(userId => 
      userConnections.get(userId).size > 0
    );
    
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
        const userId = socket.userId;
        
        // Remove this connection from tracking
        if (userConnections.has(userId)) {
          userConnections.get(userId).delete(socket.id);
          
          // Only broadcast offline if this was the last connection for this user
          if (userConnections.get(userId).size === 0) {
            userConnections.delete(userId);
            io.emit("user_offline", { userId });
          }
        }
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
