import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  Box,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import axiosInstance from "../api/axiosInstance";

const Tours = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null); // Card data
  const [sortField, setSortField] = useState("booking_id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const guideId = 5;

  useEffect(() => {
    const fetchFinalizedBookings = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/guides/finalized/${guideId}`
        );
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching finalized bookings:", error);
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchFinalizedBookings();
  }, []);

  const sortedBookings = [...bookings].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const paginated = sortedBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSendRequest = async (bookingId) => {
    try {
      const response = await axiosInstance.get(
        `/api/guides/finalized/details/${bookingId}`
      );
      setSelectedBooking(response.data);
    } catch (err) {
      console.error("Error fetching booking details:", err);
    }
  };

  return (
    <div>
      <div className="m-4">
        <h1>Assigned Tours</h1>
        <p>Admin reviewed and assigned bookings to you!</p>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && bookings.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">#</TableCell>
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
                  <TableCell align="center">Headcount</TableCell>
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
                  <TableCell align="left">Duration</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginated.map((booking, index) => (
                  <TableRow key={booking.booking_id}>
                    <TableCell align="center">
                      {index + 1 + page * rowsPerPage}
                    </TableCell>
                    <TableCell align="center">{booking.booking_id}</TableCell>
                    <TableCell align="center">{booking.headcount}</TableCell>
                    <TableCell align="center">
                      {dayjs(booking.booking_date).format("YYYY-MM-DD")}
                    </TableCell>
                    <TableCell align="left">
                      {dayjs(booking.end_date).diff(
                        dayjs(booking.start_date),
                        "day"
                      )}{" "}
                      days
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        onClick={() => handleSendRequest(booking.booking_id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[8, 10, 25]}
            component="div"
            count={bookings.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      )}

      {/* Details Dialog */}
      <Dialog
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Booking Details
          <IconButton
            aria-label="close"
            onClick={() => setSelectedBooking(null)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Typography>Booking ID: {selectedBooking?.booking_id}</Typography>
          <Typography>Headcount: {selectedBooking?.headcount}</Typography>
          <Typography>
            Booking Date:{" "}
            {dayjs(selectedBooking?.booking_date).format("YYYY-MM-DD")}
          </Typography>
          <Typography>
            Start Date:{" "}
            {dayjs(selectedBooking?.start_date).format("YYYY-MM-DD")}
          </Typography>
          <Typography>
            End Date: {dayjs(selectedBooking?.end_date).format("YYYY-MM-DD")}
          </Typography>
          <Typography>
            Check-in:{" "}
            {dayjs(selectedBooking?.check_in_date).format("YYYY-MM-DD")}
          </Typography>
          <Typography>
            Check-out:{" "}
            {dayjs(selectedBooking?.check_out_date).format("YYYY-MM-DD")}
          </Typography>
          <Typography>Status: {selectedBooking?.status}</Typography>
          <Typography>Tourist ID: {selectedBooking?.tourist_id}</Typography>
          <Typography>Tour ID: {selectedBooking?.tour_id}</Typography>
          <Typography>Event ID: {selectedBooking?.event_id}</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSelectedBooking(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Tours;
