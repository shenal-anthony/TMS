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
      io.to(room).emit("new-request", data);
    });

    socket.on("guide-response", (data) => {
      console.log("Guide accepted request:", data);

      const { guideId, bookingId, status, timestamp } = data;

      // You could store this in a DB or memory (optional)
      if (status === "accepted") {
        io.to("admin_room").emit("guide-accepted", {
          guideId,
          bookingId,
          timestamp,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};
