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
} from "@mui/material";
import dayjs from "dayjs";

const ViewBookings = () => {
  const [bookingContents, setBookingContents] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [isEditingPackage, setIsEditingPackage] = useState(false);
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

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fectchBookings();
  }, []);

  const handleFinalizeBooking = (bookingId) => {
    axios
      .patch(`${apiUrl}/api/bookings/${bookingId}`, { status: "finalized" })
      .then(() => {
        fectchBookings(); // refresh list
      })
      .catch((err) => {
        console.error("Failed to finalize booking", err);
      });
  };

  const fectchBookings = () => {
    axios
      .get(`${apiUrl}/api/bookings`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setBookingContents(response.data);
        } else {
          setBookingError("Response data is not an array");
        }
        setBookingLoading(false);
      })
      .catch((bookingError) => {
        setBookingError(
          "Error fetching bookingContents: " + bookingError.message
        );
        setBookingLoading(false);
      });
  };

  const handleEditBooking = (booking) => {
    setCurrentBooking({
      booking_id: booking.booking_id,
      bookingDate: booking.booking_date,
      headcount: booking.headcount,
      checkInDate: booking.check_in_date,
      checkOutDate: booking.check_out_date,
      status: booking.status,
      touristId: booking.tourist_id,
      tourId: booking.tour_id,
      userId: booking.user_id,
      eventId: booking.event_id,
    });
    setIsEditingBooking(true);
    setOpenBookingDialog(true);
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
        fectchBookings(); // refresh list
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

  return (
    <div>
      <div className="mb-4">ViewBookings</div>
      <div>
        {/* Booking Table */}
        <TableContainer component={Paper}>
          <Table>
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
              {bookingContents.length > 0 ? (
                bookingContents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((booking, index) => (
                    <TableRow
                      key={booking.booking_id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                          cursor: "default",
                        },
                      }}
                    >
                      <TableCell align="center">
                        {index + 1 + page * rowsPerPage}
                      </TableCell>
                      <TableCell align="center">{booking.booking_id}</TableCell>
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
          count={bookingContents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
      <Dialog
        open={openBookingDialog}
        onClose={() => setOpenBookingDialog(false)}
      >
        <DialogTitle>Update Booking</DialogTitle>
        <DialogContent>
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
            name="checkOutDate"
            label="Check-Out Date"
            type="date"
            fullWidth
            value={dayjs(currentBooking.checkOutDate).format("YYYY-MM-DD")}
            onChange={handleBookingInputChange}
          />
          <TextField
            margin="dense"
            name="status"
            label="Status"
            fullWidth
            value={currentBooking.status}
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
    </div>
  );
};

export default ViewBookings;
