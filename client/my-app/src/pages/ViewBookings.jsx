import React, { useEffect, useState } from "react";
import axios from "axios";
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
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  DialogContentText,
} from "@mui/material";
import dayjs from "dayjs";

const ViewBookings = () => {
  const [confirmedBookingContents, setConfirmedBookingContents] = useState([]);
  const [finalizedBookingContents, setFinalizedBookingContents] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [finalizedBookingLoading, setFinalizedBookingLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [finalizedPage, setFinalizedPage] = useState(0);
  const [finalizedRowsPerPage, setFinalizedRowsPerPage] = useState(8);

  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [openFinalizedBookingDialog, setOpenFinalizedBookingDialog] =
    useState(false);
  const [isEditingBooking, setIsEditingBooking] = useState(false);

  const [currentBooking, setCurrentBooking] = useState({
    bookingDate: "",
    headcount: "",
    checkInDate: "",
    checkOutDate: "",
    status: "",
    touristId: "",
    tourId: "",
    userId: "",
    eventId: "",
  });
  const [currentFinalizedBooking, setCurrentFinalizedBooking] = useState(null);
  const resetBookingForm = () => {
    setCurrentBooking({
      bookingDate: "",
      headcount: "",
      checkInDate: "",
      checkOutDate: "",
      status: "",
      touristId: "",
      tourId: "",
      userId: "",
      eventId: "",
      startDate: "",
      endDate: "",
      guideId: "",
    });
  };

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchBookings();
    fetchFinalizedBookings();
  }, []);

  const handleFinalizeBooking = (bookingId) => {
    if (
      !window.confirm(
        `Are you sure, you want to finalized booking Id:${bookingId} ?`
      )
    )
      return;
    axios
      .patch(`${apiUrl}/api/bookings/${bookingId}`, { status: "finalized" })
      .then(() => {
        fetchBookings(); // refresh list

        // Delay before fetching finalized bookings
        setTimeout(() => {
          fetchFinalizedBookings(); // Refresh finalized bookings after delay
        }, 500); // delay in milliseconds (e.g., 500ms)
      })

      .catch((err) => {
        console.error("Failed to finalize the booking", err);
      });
  };

  const fetchBookings = () => {
    axios
      .get(`${apiUrl}/api/bookings`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setConfirmedBookingContents(response.data);
        } else {
          setBookingError("Response data is not an array");
        }
        setBookingLoading(false);
      })
      .catch((bookingError) => {
        setBookingError(
          "Error fetching confirmedBookingContents: " + bookingError.message
        );
        setBookingLoading(false);
      });
  };

  const fetchFinalizedBookings = () => {
    axios
      .get(`${apiUrl}/api/bookings/finalized`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setFinalizedBookingContents(response.data);
        } else {
          setBookingError("Response data is not an array");
        }
        setBookingLoading(false);
      })
      .catch((bookingError) => {
        setBookingError(
          "Error fetching confirmedBookingContents: " + bookingError.message
        );
        setBookingLoading(false);
      });
  };

  const handleEditBooking = (booking) => {
    setCurrentBooking({
      booking_id: booking.booking_id,
      bookingDate: booking.booking_date,
      startDate: booking.start_date,
      endDate: booking.end_date,
      headcount: booking.headcount,
      checkInDate: booking.check_in_date,
      touristId: booking.tourist_id,
      tourId: booking.tour_id,
      guideId: booking.guide_id,
      eventId: booking.event_id,
    });
    setIsEditingBooking(true);
    setOpenBookingDialog(true);
  };

  const handleViewBooking = (booking) => {
    axios
      .get(`${apiUrl}/api/bookings/finalized/${booking.booking_id}`, {
        params: { guideId: booking.guide_id },
      })
      .then((response) => {
        const data = response.data;

        if (data && data.booking && data.guide) {
          // Combine or structure the data as needed
          setCurrentFinalizedBooking({
            ...data.booking,
            guide: data.guide,
          });
          setOpenFinalizedBookingDialog(true);
        } else {
          setBookingError("Invalid response format from server.");
        }

        setFinalizedBookingLoading(false);
      })
      .catch((bookingError) => {
        setBookingError(
          "Error fetching confirmedBookingContents: " + bookingError.message
        );
        setFinalizedBookingLoading(false);
      });
  };

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBooking((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingUpdate = () => {
    axios
      .put(
        `${apiUrl}/api/bookings/${currentBooking.booking_id}`,
        currentBooking
      )
      .then(() => {
        fetchBookings(); // refresh list
        setOpenBookingDialog(false);
        resetBookingForm();
      })
      .catch((err) => {
        console.error("Failed to update booking", err);
      });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFinalizedChangePage = (event, newPage) => {
    setFinalizedPage(newPage);
  };

  const handleFinalizedChangeRowsPerPage = (event) => {
    setFinalizedRowsPerPage(parseInt(event.target.value, 10));
    setFinalizedPage(0);
  };

  return (
    <div>
      <div>
        {" "}
        <Typography variant="h4" color="initial">
          View Bookings
        </Typography>
      </div>
      <div>
        {/* confirmed bookings  */}
        <div>
          <div className="mb-4">Currently Ongoing Tours</div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">#</TableCell>
                  <TableCell align="center">Booking ID</TableCell>
                  <TableCell align="center">Check In Date</TableCell>
                  <TableCell align="center">Check Out Date</TableCell>
                  <TableCell align="center">Booking Date</TableCell>
                  <TableCell align="center">Guide</TableCell>
                  <TableCell align="center">Price</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {confirmedBookingContents.length > 0 ? (
                  confirmedBookingContents
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((booking, index) => (
                      <TableRow
                        key={booking.booking_id}
                        sx={{
                          "&:hover td": {
                            backgroundColor: "#e3f2fd",
                          },
                        }}
                      >
                        <TableCell align="center">
                          {index + 1 + page * rowsPerPage}
                        </TableCell>
                        <TableCell align="center">
                          {booking.booking_id}
                        </TableCell>
                        <TableCell align="center">
                          {dayjs(booking.check_in_date).format("YYYY-MM-DD")}
                        </TableCell>
                        <TableCell align="center">
                          {dayjs(booking.check_out_date).format("YYYY-MM-DD")}
                        </TableCell>
                        <TableCell align="center">
                          {dayjs(booking.booking_date).format("YYYY-MM-DD")}
                        </TableCell>

                        {/* get the user_id from assigned_guides table */}
                        <TableCell align="center">
                          {booking.guide_id ? booking.guide_id : "N/A"}
                        </TableCell>

                        {/* get the price from packages table */}
                        <TableCell align="center">
                          {booking.total_amount ? booking.total_amount : "N/A"}
                        </TableCell>

                        <TableCell style={{ display: "flex" }} align="center">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleEditBooking(booking)}
                          >
                            Update
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() =>
                              handleFinalizeBooking(booking.booking_id)
                            }
                            style={{ marginLeft: "10px" }}
                          >
                            Finalize
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No booking found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[8, 10, 25]}
            component="div"
            count={confirmedBookingContents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>

        {/* finalized bookings */}
        <div className="mt-4">
          <div className="mb-4">Finalized Tours</div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">#</TableCell>
                  <TableCell align="center">Booking ID</TableCell>
                  <TableCell align="center">Check In Date</TableCell>
                  <TableCell align="center">Check Out Date</TableCell>
                  <TableCell align="center">Guide</TableCell>
                  <TableCell align="center">Price</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {finalizedBookingContents.length > 0 ? (
                  finalizedBookingContents
                    .slice(
                      finalizedPage * finalizedRowsPerPage,
                      finalizedPage * finalizedRowsPerPage +
                        finalizedRowsPerPage
                    )
                    .map((booking, index) => (
                      <TableRow
                        key={booking.booking_id}
                        sx={{
                          "&:hover td": {
                            backgroundColor: "#e3f2fd !important",
                          },
                        }}
                      >
                        <TableCell align="center">
                          {index + 1 + finalizedPage * finalizedRowsPerPage}
                        </TableCell>
                        <TableCell align="center">
                          {booking.booking_id}
                        </TableCell>
                        <TableCell align="center">
                          {dayjs(booking.check_in_date).format("YYYY-MM-DD")}
                        </TableCell>
                        <TableCell align="center">
                          {dayjs(booking.check_out_date).format("YYYY-MM-DD")}
                        </TableCell>

                        {/* get the user_id from assigned_guides table */}
                        <TableCell align="center">
                          {booking.guide_id ? booking.guide_id : "N/A"}
                        </TableCell>

                        {/* get the price from packages table */}
                        <TableCell align="center">
                          {booking.total_amount ? booking.total_amount : "N/A"}
                        </TableCell>

                        <TableCell style={{ display: "flex" }} align="center">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleViewBooking(booking)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No booking found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination for finalized table */}
          <TablePagination
            rowsPerPageOptions={[8, 10, 25]}
            component="div"
            count={finalizedBookingContents.length}
            rowsPerPage={finalizedRowsPerPage}
            page={finalizedPage}
            onPageChange={handleFinalizedChangePage}
            onRowsPerPageChange={handleFinalizedChangeRowsPerPage}
          />
        </div>
      </div>
      {/* update Confirmed Booking Dialog */}
      <Dialog
        open={openBookingDialog}
        onClose={() => setOpenBookingDialog(false)}
      >
        <DialogTitle>Update Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Booking ID:</strong> {currentBooking.booking_id}
          </DialogContentText>
          <DialogContentText>
            <strong>Booking Date:</strong>{" "}
            {dayjs(currentBooking.bookingDate).format("YYYY-MM-DD")}
          </DialogContentText>
          <DialogContentText>
            <strong>Tourist ID:</strong> {currentBooking.touristId}
          </DialogContentText>
          <DialogContentText>
            <strong>Tour ID:</strong> {currentBooking.tourId}
          </DialogContentText>
          <DialogContentText>
            <strong>Event ID:</strong> {currentBooking.eventId}
          </DialogContentText>

          <TextField
            margin="dense"
            name="headcount"
            label="Headcount"
            type="number"
            fullWidth
            value={currentBooking.headcount}
            onChange={handleBookingInputChange}
          />
          <TextField
            margin="dense"
            name="checkInDate"
            label="Check-In Date"
            type="date"
            fullWidth
            value={dayjs(currentBooking.checkInDate).format("YYYY-MM-DD")}
            onChange={handleBookingInputChange}
          />
          <TextField
            margin="dense"
            name="startDate"
            label="Start Date"
            type="date"
            fullWidth
            value={dayjs(currentBooking.startDate).format("YYYY-MM-DD")}
            onChange={handleBookingInputChange}
          />
          <TextField
            margin="dense"
            name="endDate"
            label="End Date"
            type="date"
            fullWidth
            value={dayjs(currentBooking.endDate).format("YYYY-MM-DD")}
            onChange={handleBookingInputChange}
          />
          <TextField
            margin="dense"
            name="assignedGuideId"
            label="Assgined Guide ID"
            fullWidth
            value={currentBooking.guideId}
            onChange={handleBookingInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBookingDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleBookingUpdate}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Finalized Booking Dialog */}
      {currentFinalizedBooking && (
        <Dialog
          open={openFinalizedBookingDialog}
          onClose={() => setOpenFinalizedBookingDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Finalized Booking Details</DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
              <strong>Booking ID:</strong> {currentFinalizedBooking.booking_id}
            </Typography>
            <Typography gutterBottom>
              <strong>Check In Date:</strong>{" "}
              {dayjs(currentFinalizedBooking.check_in_date).format(
                "YYYY-MM-DD"
              )}
            </Typography>
            <Typography gutterBottom>
              <strong>Check Out Date:</strong>{" "}
              {dayjs(currentFinalizedBooking.check_out_date).format(
                "YYYY-MM-DD"
              )}
            </Typography>
            <Typography gutterBottom>
              <strong>Booking Date:</strong>{" "}
              {dayjs(currentFinalizedBooking.booking_date).format("YYYY-MM-DD")}
            </Typography>
            <Typography gutterBottom>
              <strong>Tourist ID:</strong> {currentFinalizedBooking.tourist_id}
            </Typography>
            <Typography gutterBottom>
              <strong>Tour ID:</strong> {currentFinalizedBooking.tour_id}
            </Typography>
            <Typography gutterBottom>
              <strong>Event ID:</strong> {currentFinalizedBooking.event_id}
            </Typography>
            <Typography gutterBottom>
              <strong>User ID (Admin Id):</strong>{" "}
              {currentFinalizedBooking.user_id}
            </Typography>
            <Typography gutterBottom>
              <strong>Guide ID:</strong> {currentFinalizedBooking.guide.user_id}
            </Typography>
            {currentFinalizedBooking.guide && (
              <>
                <Typography gutterBottom>
                  <strong>Guide Name:</strong>{" "}
                  {currentFinalizedBooking.guide.first_name}{" "}
                  {currentFinalizedBooking.guide.last_name}
                </Typography>
                <Typography gutterBottom>
                  <strong>Guide Email:</strong>{" "}
                  {currentFinalizedBooking.guide.email_address}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenFinalizedBookingDialog(false)}
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default ViewBookings;
