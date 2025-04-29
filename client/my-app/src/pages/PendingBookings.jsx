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
  Typography,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const PendingBookings = () => {
  const [groupedBookings, setGroupedBookings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const groupByBooking = (data) => {
    const grouped = {};
    data.forEach((item) => {
      if (!grouped[item.booking_id]) {
        grouped[item.booking_id] = [];
      }
      grouped[item.booking_id].push(item);
    });
    return grouped;
  };

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/api/bookings/pending`);
      setGroupedBookings(groupByBooking(res.data));
      setLoading(false);
    } catch (err) {
      setError("Error fetching pending bookings: " + err.message);
      setLoading(false);
    }
  };

  const fetchBookings = async (startDate, endDate) => {
    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/api/bookings/filtered-pending`, {
        startDate,
        endDate,
      });
      setGroupedBookings(groupByBooking(res.data));
      setLoading(false);
    } catch (err) {
      setError("Error fetching filtered bookings: " + err.message);
      setLoading(false);
    }
  };

  const handleAssignGuide = (bookingId, guideId) => {
    axios
      .put(`${apiUrl}/api/bookings/${bookingId}/assign`, { guideId })
      .then(() => {
        const updated = { ...groupedBookings };
        delete updated[bookingId];
        setGroupedBookings(updated);
      })
      .catch((error) => {
        setError("Error assigning guide: " + error.message);
      });
  };

  const bookingIds = Object.keys(groupedBookings);
  const paginatedIds = bookingIds.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Pending Bookings
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction="row" spacing={2} alignItems="center" marginBottom={2}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            format="YYYY-MM-DD"
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            format="YYYY-MM-DD"
          />
          <Button
            variant="contained"
            onClick={() => {
              if (startDate && endDate) {
                fetchBookings(
                  dayjs(startDate).format("YYYY-MM-DD"),
                  dayjs(endDate).format("YYYY-MM-DD")
                );
              } else {
                setError("Please select both start and end dates.");
              }
            }}
          >
            Search Available Guides
          </Button>
          <Button variant="outlined" onClick={fetchPendingBookings}>
            Reset Filter
          </Button>
        </Stack>
      </LocalizationProvider>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && bookingIds.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Booking Date</TableCell>
                  <TableCell>Guide ID</TableCell>
                  <TableCell>Guide Name</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedIds.map((bookingId) =>
                  groupedBookings[bookingId].map((guide, index) => (
                    <TableRow key={`${bookingId}-${guide.guide_id}`}>
                      <TableCell>{index === 0 ? bookingId : ""}</TableCell>
                      <TableCell>
                        {dayjs(guide.booking_date).format("YYYY-MM-DD")}
                      </TableCell>
                      <TableCell>{guide.guide_id}</TableCell>
                      <TableCell>
                        {guide.first_name + " " + guide.last_name}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          onClick={() =>
                            handleAssignGuide(bookingId, guide.guide_id)
                          }
                        >
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[8, 10, 25]}
            component="div"
            count={bookingIds.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </>
      )}
    </div>
  );
};

export default PendingBookings;
