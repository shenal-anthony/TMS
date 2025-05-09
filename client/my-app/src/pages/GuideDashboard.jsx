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
  Divider,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../api/axiosInstance";
import io from "socket.io-client";
import StatusCard from "../components/StatusCard";
import {
  EventAvailable,
  CheckCircle,
  Tour,
  DirectionsCar,
} from "@mui/icons-material";
const iconMap = {
  VehicleIcon: <DirectionsCar fontSize="medium" />, // For Vehicles
  ConfirmedBookingIcon: <CheckCircle fontSize="medium" />, // For Confirmed Bookings
  OngoingTourIcon: <Tour fontSize="medium" />, // For Ongoing Tours
  FinalizedBookingIcon: <EventAvailable fontSize="medium" />, // For Finalized Bookings
};

const GuideDashboard = ({ userId }) => {
  const [guides, setGuides] = useState(null);
  const [statusCardsData, setStatusCardsData] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const guideId = userId;
  const apiUrl = import.meta.env.VITE_API_URL;
  const [sortConfig, setSortConfig] = useState({
    key: "sent_at",
    direction: "desc",
  });

  const getStatusIndicator = (status) => {
    const isActive = status?.toLowerCase() === "active";
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: isActive ? "green" : "red",
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {isActive ? "Active" : "Inactive"}
        </Typography>
      </Box>
    );
  };

  const sortedRequests = [...requests].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const fetchStatusCardsData = async () => {
    try {
      setLoadingCards(true);
      const response = await axiosInstance.get(
        `${apiUrl}/api/reports/cards/${guideId}`
      );
      const data = response.data.map((item) => ({
        ...item,
        icon: iconMap[item.icon],
      }));
      setStatusCardsData(data);
    } catch (error) {
      console.error("Error fetching status card data:", error);
      toast.error("Failed to fetch status card data.");
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    socketRef.current = io(apiUrl);

    const fetchGuides = async () => {
      try {
        const res = await axiosInstance.get(`/api/guides/${guideId}`);
        setGuides(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching guide:", error);
        setError("Failed to fetch guide");
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
        console.error("Failed to fetch pending requests", err);
      }
    };

    fetchGuides();
    fetchPendingRequests();
    fetchStatusCardsData();

    if (guideId) {
      socketRef.current.emit("join-room", `guide_${guideId}`);
    }

    socketRef.current.on("new-request", (data) => {
      toast(
        <Box>
          <Box display="flex" alignItems="center" mb={0.5}>
            <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              New Booking Request
            </Typography>
          </Box>
          <Typography variant="body2">
            <strong>Booking ID:</strong> {data.bookingId}
          </Typography>
          <Typography variant="body2">
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
    const confirmed = window.confirm(
      "Are you sure you want to Accept this request?"
    );
    if (!confirmed) return;
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
      await axiosInstance.delete(
        `/api/bookings/requests/${bookingId}/${guideId}`
      );
      setRequests((prev) => prev.filter((req) => req.booking_id !== bookingId));
    } catch (error) {
      console.error("Error deleting guide request:", error);
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      {/* Status Cards Section */}
      <Box>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="subtitle1" gutterBottom>
          A quick data overview.
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box display="flex" flexDirection="column" gap={0.5} m="0.1rem 0 0.5rem 0.3rem">
          <Typography variant="h5">
            Welcome, {guides?.first_name} {guides?.last_name}
          </Typography>
          {getStatusIndicator(guides?.status)}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "text.secondary", fontSize: "0.8rem" }}
          >
            Refresh Cards
          </Typography>
          <IconButton onClick={fetchStatusCardsData} disabled={loadingCards}>
            {loadingCards ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        {statusCardsData.length > 0 ? (
          statusCardsData.map((card, index) => (
            <StatusCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
            />
          ))
        ) : (
          <Typography variant="body1">No data available.</Typography>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" sx={{ mt: 3 }}>
        Incoming Requests
      </Typography>

      {requests.length === 0 ? (
        <Typography>No pending requests</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  onClick={() => handleSort("booking_id")}
                  sx={{ cursor: "pointer" }}
                >
                  <strong>Booking ID</strong>
                  {sortConfig.key === "booking_id" &&
                    (sortConfig.direction === "asc" ? " ⬆️" : " ⬇️")}
                </TableCell>
                <TableCell
                  align="center"
                  onClick={() => handleSort("sent_at")}
                  sx={{ cursor: "pointer" }}
                >
                  <strong>Received At</strong>
                  {sortConfig.key === "sent_at" &&
                    (sortConfig.direction === "asc" ? " ⬆️" : " ⬇️")}
                </TableCell>
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedRequests.map((req, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{req.booking_id}</TableCell>
                  <TableCell align="center">
                    {new Date(req.sent_at).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleAccept(req.booking_id)}
                      >
                        ✅ Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleReject(req.booking_id)}
                      >
                        ❌ Reject
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default GuideDashboard;
