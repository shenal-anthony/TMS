const { saveGuideRequest, updateGuideResponse } = require("./models/guideResponseModel");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join a room specific to a guide
    socket.on("join-room", (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    // Admin sends request to a guide
    socket.on("send-guide-request", async (data) => {
      const { guideId, bookingId, sentAt } = data;

      // Save to DB
      await saveGuideRequest({ guideId, bookingID: bookingId, sentAt });

      // Emit to guide's room
      io.to(`guide_${guideId}`).emit("new-request", {
        bookingId,
        guideId,
        timestamp: new Date().toISOString(),
      });

      console.log("📨 Guide request sent:", { guideId, bookingId, sentAt });
    });

    // Guide responds (accept/reject)
    socket.on("guide-response", async (data) => {
      const { guideId, bookingId, status } = data;

      // Save response to DB
      await updateGuideResponse(guideId, bookingId, status);

      // Optionally, notify admin room
      io.to("admin_room").emit("guide-response", {
        guideId,
        bookingId,
        status: status,
        updatedAt: new Date().toISOString(),
      });

      console.log("📥 Guide responded:", { guideId, bookingId, status });
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};
