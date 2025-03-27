import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import {
  DirectionsCar as VehicleIcon,
  Book as BookingIcon,
  PendingActions as PendingIcon,
  Refresh as OngoingIcon,
} from "@mui/icons-material";
import axios from "axios";
import StatusCard from "../components/StatusCard";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Status cards data
  const statusCards = [
    {
      title: "Vehicle Status",
      value: "24",
      icon: <VehicleIcon fontSize="large" />,
    },
    {
      title: "Booking Status",
      value: "156",
      icon: <BookingIcon fontSize="large" />,
    },
    {
      title: "Ongoing Status",
      value: "18",
      icon: <OngoingIcon fontSize="large" />,
    },
    {
      title: "Pending Booking Status",
      value: "23",
      icon: <PendingIcon fontSize="large" />,
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${apiUrl}/api/auth/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate, apiUrl]);

  return (
    <div>
    <Box sx={{ m: 1 }}>
      {/* Dashboard Header */}
      <div>
        <Typography variant="h5" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
          A quick data overview of the System.
        </Typography>
      </div>

      {/* Status Cards - Flexbox Layout */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
          "& > *": {
            flex: "1 1 1",
            minWidth: 0,
          },
        }}
      >
        {statusCards.map((card, index) => (
          <StatusCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
          />
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Pending Bookings Section */}
      <Typography variant="h5" component="h1" gutterBottom>
        Booking Status
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
        Date view of pending bookings
      </Typography>

      {/* Pending Bookings Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="pending bookings table">
          <TableHead>
            <TableRow>
              <TableCell>Booking Id</TableCell>
              <TableCell>Available Guides</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.id}</TableCell>
                <TableCell>{booking.availableGuides}</TableCell>
                <TableCell>
                  <Button variant="contained" size="small" color="primary">
                    Send request
                  </Button>
                </TableCell>
              </TableRow>
            ))} */}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
    </div>
  );
};

export default Dashboard;
