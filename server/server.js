import dotenv from "dotenv";

import http from "http";

import { Server } from "socket.io";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://genixchat.vercel.app",
  },
});

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", ({ roomId, username }) => {
    socket.join(roomId);

    socket.roomId = roomId;

    socket.username = username;

    if (!onlineUsers[roomId]) {
      onlineUsers[roomId] = [];
    }

    onlineUsers[roomId] = onlineUsers[roomId].filter(
      (user) => user !== username,
    );

    onlineUsers[roomId].push(username);

    io.to(roomId).emit("online_users", onlineUsers[roomId]);

    console.log(`Socket joined room: ${roomId}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.roomId).emit("receive_message", data);
  });

  socket.on("typing", (data) => {
    socket.to(data.roomId).emit("user_typing", data.username);
  });

  socket.on("disconnect", () => {
    const roomId = socket.roomId;

    const username = socket.username;

    if (roomId && onlineUsers[roomId]) {

      onlineUsers[roomId] = onlineUsers[roomId].filter(
        (user) => user !== username,
      );

      if (onlineUsers[roomId].length === 0) {
        delete onlineUsers[roomId];
      }

      io.to(roomId).emit("online_users", onlineUsers[roomId] || []);
    }

    console.log("User disconnected");
  });

  socket.on("kick_user", ({ targetUsername, roomId }) => {
    for (const [id, sock] of io.of("/").sockets) {
      if (sock.username === targetUsername && sock.roomId === roomId) {
        sock.emit("kicked");

        sock.leave(roomId);

        if (onlineUsers[roomId]) {
          onlineUsers[roomId] = onlineUsers[roomId].filter(
            (user) => user !== targetUsername,
          );
        }

        io.to(roomId).emit("online_users", onlineUsers[roomId]);
      }
    }
  });

  socket.on("leave_room", ({ roomId, username }) => {
    socket.leave(roomId);

    if (onlineUsers[roomId]) {
      onlineUsers[roomId] = onlineUsers[roomId].filter(
        (user) => user !== username,
      );
    }

    io.to(roomId).emit("online_users", onlineUsers[roomId]);
  });

  socket.on("room_deleted", (roomId) => {
    socket.to(roomId).emit("room_deleted");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
