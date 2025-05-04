import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "../api/axiosInstance";
import io from "socket.io-client";

const GuideDashboard = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const guideId = 3;

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);

    const fetchGuides = async () => {
      try {
        const res = await axiosInstance.get("/api/guides/");
        setGuides(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch guides");
        setLoading(false);
      }
    };

    fetchGuides();

    if (guideId) {
      socket.emit("join-room", `guide_${guideId}`);
    }

    socket.on("new-request", (data) => {
      console.log("📡 New guide request received:", data);
      // Optionally show a toast or notification
      alert(
        `New request for you (Guide ${guideId}): Booking ID ${data.bookingId}`
      );
    });

    return () => {
      socket.disconnect(); // Clean up socket on unmount
    };
  }, [guideId]);

  return (
    <Paper
      sx={{ p: { xs: 2, md: 4 }, textAlign: { xs: "center", md: "left" } }}
    >
      <Typography variant="h5">Welcome, Guide</Typography>
      socket.disconnect();
      {loading ? (
        <CircularProgress sx={{ mt: 2 }} />
      ) : error ? (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      ) : (
        <List sx={{ mt: 2 }}>
          {guides.map((guide, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={guide.first_name || `Guide ${index + 1}`}
                secondary={guide.email_address || "No description available"}
              />
            </ListItem>
          ))}
        </List>
      )}
      {/* log out button here */}
      <button
        className="m-2, bg-amber-300"
        onClick={() => {
          sessionStorage.removeItem("accessToken");
          window.location.href = "/login";
        }}
      >
        Log Out
      </button>
    </Paper>
  );
};

export default GuideDashboard;