import { Server } from "socket.io";

let io;

export const initSocket = (server) => {

  //attaches socket to server
  const allowedOrigins = [
    "http://localhost:5173",
    "https://main.d2s3j9j85nw93c.amplifyapp.com"
  ];

  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, origin);
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
    socket.join(userId);
  });

  socket.on("join_conversation", (conversationId) => {
      console.log("JOIN EVENT RECEIVED:", conversationId);
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
