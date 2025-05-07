import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Paper,
  CircularProgress,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../api/axiosInstance";
import io from "socket.io-client";

const GuideDashboard = ({ userId }) => {
  const [guides, setGuides] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const guideId = userId;

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL);

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

    const fetchPendingRequests = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/bookings/requests/${guideId}`
        );
        const sorted = res.data.sort(
          (a, b) => new Date(b.sent_at) - new Date(a.sent_at)
        );
        setRequests(sorted);
      } catch (err) {
        console.error("❌ Failed to fetch pending requests", err);
      }
    };

    fetchGuides();
    fetchPendingRequests();

    if (guideId) {
      socketRef.current.emit("join-room", `guide_${guideId}`);
    }

    // Inside your socket event listener
    socketRef.current.on("new-request", (data) => {
      toast(
        <Box>
          <Box display="flex" alignItems="center" mb={0.5}>
            <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              New Booking Request
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            <strong>Booking ID:</strong> {data.bookingId}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            <strong>Sent At:</strong>{" "}
            {dayjs(data.sentAt).format("YYYY-MM-DD HH:mm:ss")}
          </Typography>
        </Box>,

        {
          position: "top-right",
          autoClose: 4000,
          pauseOnHover: true,
        }
      );

      fetchPendingRequests();
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [guideId]);

  const handleAccept = (bookingId) => {
    socketRef.current.emit("guide-response", {
      guideId,
      bookingId,
      status: "true",
      updatedAt: new Date().toISOString(),
    });
    setRequests((prev) => prev.filter((req) => req.booking_id !== bookingId));
  };

  const handleReject = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this request?"
    );
    if (!confirmed) return;

    try {
      const res = await axiosInstance.delete(
        `/api/bookings/requests/${bookingId}/${guideId}`
      );

      setRequests((prev) => prev.filter((req) => req.booking_id !== bookingId));
    } catch (error) {
      console.error("Error deleting guide request:", error);
    }
  };

  return (
    <Paper
      sx={{ p: { xs: 2, md: 4 }, textAlign: { xs: "center", md: "left" } }}
    >
      <Typography variant="h5">Welcome, Guide: {guideId}</Typography>

      <Typography variant="h6" sx={{ mt: 3 }}>
        Incoming Requests
      </Typography>

      {requests.length === 0 ? (
        <Typography>No pending requests</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Booking ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Received At</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req, index) => (
                <TableRow key={index}>
                  <TableCell>{req.booking_id}</TableCell>
                  <TableCell>
                    {new Date(req.sent_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleAccept(req.booking_id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleReject(req.booking_id)}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Email</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {guides.map((guide, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {guide.first_name || `Guide ${index + 1}`}
                  </TableCell>
                  <TableCell>{guide.email_address || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Button
        variant="contained"
        sx={{ mt: 4, backgroundColor: "#FFC107", color: "black" }}
        onClick={() => {
          sessionStorage.removeItem("accessToken");
          window.location.href = "/login";
        }}
      >
        Log Out
      </Button>
    </Paper>
  );
};

export default GuideDashboard;
