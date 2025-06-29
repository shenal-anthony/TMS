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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  DialogContentText,
  Box,
} from "@mui/material";
import dayjs from "dayjs";

const ViewBookings = ({ userId }) => {
  const [confirmedBookingContents, setConfirmedBookingContents] = useState([]);
  const [finalizedBookingContents, setFinalizedBookingContents] = useState([]);
  const [tourPrices, setTourPrices] = useState({});
  const [guides, setGuides] = useState([]); // Store guides from API
  const [bookingLoading, setBookingLoading] = useState(true);
  const [finalizedBookingLoading, setFinalizedBookingLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null);
  const adminId = userId;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [finalizedPage, setFinalizedPage] = useState(0);
  const [finalizedRowsPerPage, setFinalizedRowsPerPage] = useState(8);

  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [openFinalizedBookingDialog, setOpenFinalizedBookingDialog] =
    useState(false);
  const [isEditingBooking, setIsEditingBooking] = useState(false);

  const [currentBooking, setCurrentBooking] = useState({
    booking_id: "",
    guideId: "",
  });
  const [currentFinalizedBooking, setCurrentFinalizedBooking] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchBookings();
    fetchFinalizedBookings();
  }, []);

  const fetchGuides = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/guides`);
      if (Array.isArray(response.data)) {
        setGuides(response.data);
      } else {
        setBookingError("Guides response data is not an array");
      }
    } catch (error) {
      console.error("Error fetching guides:", error);
      setBookingError("Error fetching guides: " + error.message);
    }
  };

  const fetchBookingAmount = async (tourId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/payments/${tourId}`);
      return response.data.price || "N/A";
    } catch (error) {
      console.error(`Error fetching price for tour ${tourId}:`, error);
      return "N/A";
    }
  };

  const fetchBookings = async () => {
    setBookingLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/bookings`);
      if (Array.isArray(response.data)) {
        setConfirmedBookingContents(response.data);
        const pricePromises = response.data.map(async (booking) => {
          if (booking.tour_id) {
            const price = await fetchBookingAmount(booking.tour_id);
            return { tourId: booking.tour_id, price };
          }
          return { tourId: booking.tour_id, price: "N/A" };
        });
        const prices = await Promise.all(pricePromises);
        const priceMap = prices.reduce((acc, { tourId, price }) => {
          acc[tourId] = price;
          return acc;
        }, {});
        setTourPrices(priceMap);
      } else {
        setBookingError("Response data is not an array");
      }
    } catch (error) {
      setBookingError("Error fetching bookings: " + error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const fetchFinalizedBookings = async () => {
    setFinalizedBookingLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/bookings/finalized`);
      if (Array.isArray(response.data)) {
        setFinalizedBookingContents(response.data);
        const pricePromises = response.data.map(async (booking) => {
          if (booking.tour_id) {
            const price = await fetchBookingAmount(booking.tour_id);
            return { tourId: booking.tour_id, price };
          }
          return { tourId: booking.tour_id, price: "N/A" };
        });
        const prices = await Promise.all(pricePromises);
        const priceMap = prices.reduce((acc, { tourId, price }) => {
          acc[tourId] = price;
          return acc;
        }, {});
        setTourPrices((prev) => ({ ...prev, ...priceMap }));
      } else {
        setBookingError("Response data is not an array");
      }
    } catch (error) {
      setBookingError("Error fetching finalized bookings: " + error.message);
    } finally {
      setFinalizedBookingLoading(false);
    }
  };

  const handleFinalizeBooking = (bookingId) => {
    if (
      !window.confirm(
        `Are you sure you want to finalize booking ID: ${bookingId}?`
      )
    ) {
      return;
    }
    axios
      .patch(`${apiUrl}/api/bookings/${bookingId}`, {
        status: "finalized",
        userId: adminId,
      })
      .then(() => {
        fetchBookings();
        setTimeout(() => {
          fetchFinalizedBookings();
        }, 500);
      })
      .catch((err) => {
        console.error("Failed to finalize the booking", err);
        setBookingError("Error finalizing booking: " + err.message);
      });
  };

  const handleEditBooking = (booking) => {
    setCurrentBooking({
      booking_id: booking.booking_id,
      guideId: booking.guide_id || "",
    });
    setIsEditingBooking(true);
    fetchGuides(); // Fetch guides when opening dialog
    setOpenBookingDialog(true);
  };

  const handleCancelBooking = () => {
    if (
      !window.confirm(
        `Are you sure you want to cancel booking ID: ${currentBooking.booking_id}?`
      )
    ) {
      return;
    }
    axios
      .patch(`${apiUrl}/api/bookings/cancel/${currentBooking.booking_id}`, {
        status: "cancelled",
        userId: adminId,
      })
      .then(() => {
        fetchBookings();
        setOpenBookingDialog(false);
        setCurrentBooking({ booking_id: "", guideId: "" });
      })
      .catch((err) => {
        console.error("Failed to cancel booking", err);
        setBookingError("Error cancelling booking: " + err.message);
      });
  };

  const handleBookingUpdate = () => {
    if (!currentBooking.guideId) {
      setBookingError("Please select a guide");
      return;
    }
    axios
      .patch(`${apiUrl}/api/bookings/update/${currentBooking.booking_id}`, {
        userId: currentBooking.guideId,
        status:
          confirmedBookingContents.find(
            (b) => b.booking_id === currentBooking.booking_id
          )?.status || "confirmed",
      })
      .then(() => {
        fetchBookings();
        setOpenBookingDialog(false);
        setCurrentBooking({ booking_id: "", guideId: "" });
      })
      .catch((err) => {
        console.error("Failed to update booking", err);
        setBookingError("Error updating booking: " + err.message);
      });
  };

  const handleViewBooking = (booking) => {
    axios
      .get(`${apiUrl}/api/bookings/finalized/${booking.booking_id}`, {
        params: { guideId: booking.guide_id },
      })
      .then((response) => {
        const data = response.data;
        if (data && data.booking && data.guide) {
          setCurrentFinalizedBooking({
            ...data.booking,
            guide: data.guide,
          });
          setOpenFinalizedBookingDialog(true);
        } else {
          setBookingError("Invalid response format from server.");
        }
      })
      .catch((error) => {
        setBookingError("Error fetching booking details: " + error.message);
      });
  };

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBooking((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  if (bookingLoading || finalizedBookingLoading) return <div>Loading...</div>;
  if (bookingError) return <div>{bookingError}</div>;

  return (
    <div>
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        View Bookings
      </Typography>
      <div>
        {/* Confirmed Bookings */}
        <div className="mt-4">
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
                  {/* <TableCell align="center">Price</TableCell> */}
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
                        sx={{ "&:hover td": { backgroundColor: "#e3f2fd" } }}
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
                        <TableCell align="center">
                          {booking.guide_id || "N/A"}
                        </TableCell>
                        {/* <TableCell align="center">
                          {tourPrices[booking.tour_id] || "N/A"}
                        </TableCell> */}
                        <TableCell
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleEditBooking(booking)}
                          >
                            Update
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() =>
                              handleFinalizeBooking(booking.booking_id)
                            }
                            sx={{ ml: 1 }}
                          >
                            Finalize
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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

        {/* Finalized Bookings */}
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
                  {/* <TableCell align="center">Price</TableCell> */}
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
                        sx={{ "&:hover td": { backgroundColor: "#e3f2fd" } }}
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
                        <TableCell align="center">
                          {booking.guide_id || "N/A"}
                        </TableCell>
                        {/* <TableCell align="center">
                          {tourPrices[booking.tour_id] || "N/A"}
                        </TableCell> */}
                        <TableCell
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Button
                            size="small"
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
                    <TableCell colSpan={7} align="center">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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

        {/* Update Booking Dialog */}
        <Dialog
          open={openBookingDialog}
          onClose={() => setOpenBookingDialog(false)}
        >
          <DialogTitle>Update Booking</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <strong>Booking ID:</strong> {currentBooking.booking_id}
            </DialogContentText>
            <DialogContentText sx={{ color: "error.main", mt: 1 }}>
              Cancelling this booking will reduce the payment by 10%.
            </DialogContentText>
            <FormControl fullWidth margin="dense">
              <InputLabel id="guide-select-label">Guide</InputLabel>
              <Select
                size="small"
                labelId="guide-select-label"
                name="guideId"
                value={currentBooking.guideId}
                label="Guide"
                onChange={handleBookingInputChange}
              >
                <MenuItem value="">
                  <em>Select a guide</em>
                </MenuItem>
                {guides.map((guide) => (
                  <MenuItem key={guide.user_id} value={guide.user_id}>
                    {guide.first_name} {guide.last_name} (ID: {guide.user_id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions
            sx={{ justifyContent: "space-between", width: "100%" }}
          >
            <Box>
              <Button
                size="small"
                onClick={handleCancelBooking}
                color="error"
                variant="contained"
              >
                Cancel Booking
              </Button>
            </Box>

            <Box>
              <Button
                size="small"
                onClick={() => setOpenBookingDialog(false)}
                color="primary"
              >
                Close
              </Button>
              <Button
                size="small"
                onClick={handleBookingUpdate}
                color="primary"
                variant="contained"
              >
                Save
              </Button>
            </Box>
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
                <strong>Booking ID:</strong>{" "}
                {currentFinalizedBooking.booking_id}
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
                {dayjs(currentFinalizedBooking.booking_date).format(
                  "YYYY-MM-DD"
                )}
              </Typography>
              <Typography gutterBottom>
                <strong>Tourist ID:</strong>{" "}
                {currentFinalizedBooking.tourist_id}
              </Typography>
              <Typography gutterBottom>
                <strong>Tour ID:</strong> {currentFinalizedBooking.tour_id}
              </Typography>
              <Typography gutterBottom>
                <strong>Event ID:</strong> {currentFinalizedBooking.event_id}
              </Typography>
              <Typography gutterBottom>
                <strong>User ID (Admin):</strong>{" "}
                {currentFinalizedBooking.user_id}
              </Typography>
              <Typography gutterBottom>
                <strong>Guide ID:</strong>{" "}
                {currentFinalizedBooking.guide?.user_id || "N/A"}
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
                size="small"
                onClick={() => setOpenFinalizedBookingDialog(false)}
                color="primary"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ViewBookings;
