import React, { useEffect, useState } from "react";
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
  TablePagination,
  Button,
  Checkbox,
} from "@mui/material";
import {
  DirectionsCar as VehicleIcon,
  Book as BookingIcon,
  PendingActions as PendingIcon,
  Refresh as OngoingIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import axios from "axios";
import dayjs from "dayjs";

import StatusCard from "../components/StatusCard";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("booking_date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [page, setPage] = useState(0);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

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

    const fetchData = async () => {
      try {
        const authRes = await axios.get(`${apiUrl}/api/auth/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(authRes.data);

        const bookingRes = await axios.get(`${apiUrl}/api/bookings/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(bookingRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        setError("Failed to fetch data.");
        setLoading(false);
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate, apiUrl]);

  const handleSort = (field) => {
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(bookingIds);
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSendRequest = (bookingId, guideId) => {
    console.log(`Assigning guide ${guideId} to booking ${bookingId}`);
    // Add logic here
  };

  // --- Utilities ---
  const groupedBookings = bookings.reduce((acc, booking) => {
    if (!acc[booking.booking_id]) acc[booking.booking_id] = [];
    acc[booking.booking_id].push(booking);
    return acc;
  }, {});

  const bookingIds = Object.keys(groupedBookings);

  const sortedBookingIds = [...bookingIds].sort((a, b) => {
    const aDate = dayjs(groupedBookings[a][0][sortField]);
    const bDate = dayjs(groupedBookings[b][0][sortField]);
    return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
  });

  const paginatedIds = sortedBookingIds.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const allSelectedOnPage = paginatedIds.every((id) => selected.includes(id));
  const someSelectedOnPage =
    paginatedIds.some((id) => selected.includes(id)) && !allSelectedOnPage;

  const isSelected = (id) => selected.includes(id);

  return (
    <div>
      <div>
        <div>
          <Typography variant="h5" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
            A quick data overview of the System.
          </Typography>
        </div>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
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

        <div>
          <Typography variant="h5" gutterBottom>
            Booking Status
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
            Date view of pending bookings
          </Typography>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && bookingIds.length > 0 && (
        <>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              disabled={selected.length === 0}
              onClick={() => {
                selected.forEach((bookingId) => {
                  const guide = groupedBookings[bookingId]?.[0];
                  if (guide) handleSendRequest(bookingId, guide.guide_id);
                });
              }}
            >
              Send Requests to Selected ({selected.length})
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {/* check box  */}
                  <TableCell align="center" padding="checkbox">
                    <Checkbox
                      checked={allSelectedOnPage}
                      indeterminate={someSelectedOnPage}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell align="center">#</TableCell>
                  {/* booking Id  */}
                  <TableCell align="center">
                    <Button
                      onClick={() => handleSort("booking_id")}
                      endIcon={
                        sortField === "booking_id" ? (
                          sortOrder === "asc" ? (
                            <ArrowUpwardIcon />
                          ) : (
                            <ArrowDownwardIcon />
                          )
                        ) : null
                      }
                    >
                      Booking ID
                    </Button>
                  </TableCell>
                  {/* booking date  */}
                  <TableCell align="center">
                    <Button
                      onClick={() => handleSort("booking_date")}
                      endIcon={
                        sortField === "booking_date" ? (
                          sortOrder === "asc" ? (
                            <ArrowUpwardIcon />
                          ) : (
                            <ArrowDownwardIcon />
                          )
                        ) : null
                      }
                    >
                      Booking Date
                    </Button>
                  </TableCell>
                  <TableCell align="center">Availble Guide ID</TableCell>
                  <TableCell align="left">Available Guide Name</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedIds.map((bookingId) => (
                  <React.Fragment key={bookingId}>
                    {groupedBookings[bookingId].map((booking, index) => (
                      <TableRow
                        key={`${bookingId}-${booking.guide_id}`}
                        selected={isSelected(bookingId)}
                      >
                        <TableCell align="center" padding="checkbox">
                          {index === 0 && (
                            <Checkbox
                              checked={isSelected(bookingId)}
                              onChange={() => handleSelectRow(bookingId)}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {paginatedIds.indexOf(bookingId) +
                            1 +
                            page * rowsPerPage}
                        </TableCell>
                        <TableCell align="center">{bookingId}</TableCell>
                        <TableCell align="center">
                          {dayjs(booking.booking_date).format("YYYY-MM-DD")}
                        </TableCell>
                        <TableCell align="center">{booking.guide_id}</TableCell>
                        <TableCell align="left">
                          {booking.first_name} {booking.last_name}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            onClick={() =>
                              handleSendRequest(bookingId, booking.guide_id)
                            }
                          >
                            Send Request
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[8, 10, 25]}
            component="div"
            count={bookingIds.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      )}

      {!loading && bookingIds.length === 0 && (
        <Typography variant="body1" style={{ marginTop: 20 }}>
          No pending bookings found.
        </Typography>
      )}
    </div>
  );
};

export default Dashboard;
