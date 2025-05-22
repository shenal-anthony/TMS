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
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import dayjs from "dayjs";
import axiosInstance from "../api/axiosInstance";

const Tours = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ finalized: "", assigned: "" });
  const [bookings, setBookings] = useState([]);
  const [assignedBookings, setAssignedBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [sortField, setSortField] = useState("booking_id");
  const [sortAssignedField, setSortAssignedField] = useState("closest");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortAssignedOrder, setSortAssignedOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [assignedPage, setAssignedPage] = useState(0);
  const [rowsPerAssignedPage, setRowsPerAssignedPage] = useState(8);

  const guideId = userId;
  console.log("Guide ID:", guideId); // Log to verify guideId

  const fetchBookings = async () => {
    setLoading(true);
    setError({ finalized: "", assigned: "" }); // Reset errors

    try {
      const [finalizedRes, assignedRes] = await Promise.all([
        axiosInstance.get(`/api/guides/finalized/${guideId}`).catch((err) => {
          throw new Error(
            `Finalized bookings fetch failed: ${err.message} (Status: ${err.response?.status})`
          );
        }),
        axiosInstance.get(`/api/guides/assigned/${guideId}`).catch((err) => {
          throw new Error(
            `Assigned bookings fetch failed: ${err.message} (Status: ${err.response?.status})`
          );
        }),
      ]);

      setBookings(finalizedRes.data || []);
      setAssignedBookings(assignedRes.data || []);
      setError({ finalized: "", assigned: "" }); // Clear errors on success
    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (error.message.includes("Finalized")) {
        setError((prev) => ({ ...prev, finalized: error.message }));
        setBookings([]); // Ensure bookings array is empty on failure
      }
      if (error.message.includes("Assigned")) {
        setError((prev) => ({ ...prev, assigned: error.message }));
        setAssignedBookings([]); // Ensure assigned bookings array is empty on failure
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [guideId]);

  const handleRetry = () => {
    fetchBookings();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleAssignedSort = (field) => {
    if (sortAssignedField === field) {
      setSortAssignedOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortAssignedField(field);
      setSortAssignedOrder("asc");
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const sortedAssigned = [...assignedBookings].sort((a, b) => {
    if (sortAssignedField === "closest") {
      const today = dayjs();
      const diffA = Math.abs(today.diff(dayjs(a.booking_date), "day"));
      const diffB = Math.abs(today.diff(dayjs(b.booking_date), "day"));
      return sortAssignedOrder === "asc" ? diffA - diffB : diffB - diffA;
    } else {
      const valA = sortAssignedField.includes("date")
        ? dayjs(a[sortAssignedField])
        : a[sortAssignedField];
      const valB = sortAssignedField.includes("date")
        ? dayjs(b[sortAssignedField])
        : b[sortAssignedField];

      if (valA < valB) return sortAssignedOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortAssignedOrder === "asc" ? 1 : -1;
      return 0;
    }
  });

  const paginated = sortedBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const paginatedAssigned = sortedAssigned.slice(
    assignedPage * rowsPerAssignedPage,
    assignedPage * rowsPerAssignedPage + rowsPerAssignedPage
  );

  const handlePageChange = (_, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleAssignedPageChange = (_, newPage) => setAssignedPage(newPage);
  const handleAssignedRowsPerPageChange = (e) => {
    setRowsPerAssignedPage(parseInt(e.target.value, 10));
    setAssignedPage(0);
  };

  const handleViewRequest = async (bookingId) => {
    try {
      const response = await axiosInstance.get(
        `/api/guides/details/${bookingId}`
      );
      setSelectedBooking(response.data);
    } catch (err) {
      console.error("Error fetching booking details:", err);
      setError((prev) => ({
        ...prev,
        details: `Failed to load booking details: ${err.message} (Status: ${err.response?.status})`,
      }));
    }
  };

  return (
    <div>
      <div className="mb-4 mt-2">
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Assigned & Finalized Tours
        </Typography>
        <Typography>
          These bookings are currently assigned or finalized by admin.
        </Typography>
      </div>

      {loading && <div>Loading...</div>}

      {/* Display errors with retry option */}
      {(error.finalized || error.assigned || error.details) && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {error.finalized && (
            <div>
              {error.finalized}
              <IconButton onClick={handleRetry} size="small" sx={{ ml: 1 }}>
                <ReplayIcon />
              </IconButton>
            </div>
          )}
          {error.assigned && (
            <div>
              {error.assigned}
              <IconButton onClick={handleRetry} size="small" sx={{ ml: 1 }}>
                <ReplayIcon />
              </IconButton>
            </div>
          )}
          {error.details && <div>{error.details}</div>}
        </div>
      )}

      {/* Assigned Bookings Table */}
      {!loading && (
        <>
          <Typography variant="h6" sx={{ m: 1 }}>
            Assigned Bookings
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">#</TableCell>
                  <TableCell align="center">
                    <Button
                      onClick={() => handleAssignedSort("booking_id")}
                      endIcon={
                        sortAssignedField === "booking_id"
                          ? sortAssignedOrder === "asc"
                            ? " ⬆️"
                            : " ⬇️"
                          : null
                      }
                    >
                      Booking ID
                    </Button>
                  </TableCell>
                  <TableCell align="center">Headcount</TableCell>
                  <TableCell align="center">
                    <Button
                      onClick={() => handleAssignedSort("booking_date")}
                      endIcon={
                        sortAssignedField === "booking_date"
                          ? sortAssignedOrder === "asc"
                            ? " ⬆️"
                            : " ⬇️"
                          : null
                      }
                    >
                      Booking Date
                    </Button>
                  </TableCell>
                  <TableCell align="center">Duration</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {error.assigned ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {error.assigned}
                      <IconButton
                        onClick={handleRetry}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <ReplayIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ) : paginatedAssigned.length > 0 ? (
                  paginatedAssigned.map((booking, index) => (
                    <TableRow key={booking.booking_id}>
                      <TableCell align="center">
                        {index + 1 + assignedPage * rowsPerAssignedPage}
                      </TableCell>
                      <TableCell align="center">{booking.booking_id}</TableCell>
                      <TableCell align="center">{booking.headcount}</TableCell>
                      <TableCell align="center">
                        {dayjs(booking.booking_date).format("YYYY-MM-DD")}
                      </TableCell>
                      <TableCell align="center">
                        {dayjs(booking.end_date).diff(
                          dayjs(booking.start_date),
                          "day"
                        )}{" "}
                        days
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleViewRequest(booking.booking_id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No assigned bookings available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[8, 10, 25]}
            component="div"
            count={assignedBookings.length}
            rowsPerPage={rowsPerAssignedPage}
            page={assignedPage}
            onPageChange={handleAssignedPageChange}
            onRowsPerPageChange={handleAssignedRowsPerPageChange}
          />
        </>
      )}

      {/* Finalized Bookings Table */}
      {!loading && (
        <>
          <Typography variant="h6" sx={{ m: 2 }}>
            Finalized Bookings
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">#</TableCell>
                  <TableCell align="center">
                    <Button
                      onClick={() => handleSort("booking_id")}
                      endIcon={
                        sortField === "booking_id"
                          ? sortOrder === "asc"
                            ? " ⬆️"
                            : " ⬇️"
                          : null
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
                        sortField === "booking_date"
                          ? sortOrder === "asc"
                            ? " ⬆️"
                            : " ⬇️"
                          : null
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
                {error.finalized ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {error.finalized}
                      <IconButton
                        onClick={handleRetry}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <ReplayIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ) : paginated.length > 0 ? (
                  paginated.map((booking, index) => (
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
                          size="small"
                          onClick={() => handleViewRequest(booking.booking_id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No finalized bookings available.
                    </TableCell>
                  </TableRow>
                )}
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

      {/* Dialog */}
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
