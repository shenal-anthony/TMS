module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-room", (room) => {
      console.log(`Socket ${socket.id} joining room: ${room}`);
      socket.join(room);
    });

    socket.on("send-guide-request", (data) => {
      console.log("Guide request received:", data);

      const room = `guide_${data.guideId}`;
      io.to(room).emit("new-request", data);  // ✅ send to specific guide
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

