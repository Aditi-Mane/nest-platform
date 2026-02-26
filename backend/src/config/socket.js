import { Server } from "socket.io";

let io;

export const initSocket = (server) => {

  //attaches socket to server
  io = new Server(server)

  //a listener that runs every time a new client connects
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

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