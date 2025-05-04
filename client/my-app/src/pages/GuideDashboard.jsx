import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";
import axiosInstance from "../api/axiosInstance";
import io from "socket.io-client";

const GuideDashboard = ({ userId }) => {
  const [guides, setGuides] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const guideId = userId;

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
      setRequests((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect(); // Clean up socket on unmount
    };
  }, [guideId]);

  const handleAccept = (bookingId) => {
    const socket = io(import.meta.env.VITE_API_URL);
    socket.emit("guide-response", {
      guideId,
      bookingId,
      status: "accepted",
      timestamp: new Date().toISOString(),
    });

    // Remove the accepted request from local list
    setRequests((prev) => prev.filter((req) => req.bookingId !== bookingId));
  };

  const handleReject = (bookingId) => {
    setRequests((prev) => prev.filter((req) => req.bookingId !== bookingId));
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, textAlign: { xs: "center", md: "left" } }}>
      <Typography variant="h5">Welcome, Guide</Typography>

      <Typography variant="h6" sx={{ mt: 3 }}>
        Incoming Requests
      </Typography>
      {requests.length === 0 ? (
        <Typography>No requests</Typography>
      ) : (
        <List>
          {requests.map((req, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={`Booking ID: ${req.bookingId}`}
                secondary={`Received at: ${new Date(req.timestamp).toLocaleTimeString()}`}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAccept(req.bookingId)}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleReject(req.bookingId)}
                >
                  Reject
                </Button>
              </Stack>
            </ListItem>
          ))}
        </List>
      )}

      <Typography variant="h6" sx={{ mt: 4 }}>
        Guide List
      </Typography>
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

      <button
        className="m-2 bg-amber-300"
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