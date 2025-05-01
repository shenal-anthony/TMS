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
  Checkbox,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
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
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("booking_id");
  const [selectedIds, setSelectedIds] = useState([]);

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
      setError(null);
    } catch (err) {
      setError("Error fetching pending bookings: " + err.message);
      setLoading(false);
    }
  };

  const fetchFilteredBookings = async (startDate, endDate) => {
    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/api/bookings/filtered-pending`, {
        startDate,
        endDate,
      });
      setGroupedBookings(groupByBooking(res.data));
      setLoading(false);
      setError(null);
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
        // Remove from selectedIds if it was selected
        setSelectedIds((prev) => prev.filter((id) => id !== bookingId));
        setError(null);
      })
      .catch((error) => {
        setError("Error assigning guide: " + error.message);
      });
  };

  const handleSelectRow = (bookingId) => {
    setSelectedIds((prev) =>
      prev.includes(bookingId)
        ? prev.filter((id) => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all items across all pages
      setSelectedIds(sortedBookingIds);
    } else {
      // Deselect all
      setSelectedIds([]);
    }
  };

  const isSelected = (bookingId) => selectedIds.includes(bookingId);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  const sortedBookingIds = Object.keys(groupedBookings).sort((a, b) => {
    if (sortField === "booking_id") {
      return sortOrder === "asc" ? a - b : b - a;
    } else if (sortField === "booking_date") {
      const dateA = groupedBookings[a][0].booking_date;
      const dateB = groupedBookings[b][0].booking_date;
      return sortOrder === "asc"
        ? new Date(dateA) - new Date(dateB)
        : new Date(dateB) - new Date(dateA);
    }
    return 0;
  });

  const paginatedIds = sortedBookingIds.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const bookingIds = Object.keys(groupedBookings);

  // Check if all items on current page are selected
  const allSelectedOnPage =
    paginatedIds.length > 0 &&
    paginatedIds.every((id) => selectedIds.includes(id));

  // Check if some but not all items on current page are selected
  const someSelectedOnPage =
    paginatedIds.some((id) => selectedIds.includes(id)) && !allSelectedOnPage;

  return (
    <div>
      <div className="m-2">
        <Typography variant="h4" gutterBottom>
          Pending Bookings
        </Typography>
      </div>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction="row" spacing={2} alignItems="center" marginBottom={2}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              format="YYYY-MM-DD"
              slotProps={{ textField: { size: "small" } }}
            />

            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              format="YYYY-MM-DD"
              slotProps={{ textField: { size: "small" } }}
            />
          </div>

          {/* filter buttons  */}
          <div
            style={{
              display: "flex",
              flexWrap: "nowrap",
              gap: "10px",
              marginLeft: "40px",
            }}
          >
            <div style={{ minWidth: "154px" }}>
              <Button
                variant="contained"
                size="medium"
                fullWidth
                onClick={() => {
                  if (!startDate || !endDate) {
                    setError("Please select both start and end dates.");
                    return;
                  }
                  if (dayjs(startDate).isAfter(dayjs(endDate))) {
                    setError("Start date cannot be after end date.");
                    return;
                  }

                  fetchFilteredBookings(
                    dayjs(startDate).format("YYYY-MM-DD"),
                    dayjs(endDate).format("YYYY-MM-DD")
                  );
                }}
              >
                Filter Bookings
              </Button>
            </div>

            <div style={{ minWidth: "154px" }}>
              <Button
                variant="outlined"
                size="medium"
                fullWidth
                onClick={fetchPendingBookings}
              >
                Reset Filter
              </Button>
            </div>
          </div>
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
                  <TableCell align="center" padding="checkbox">
                    <Checkbox
                      checked={allSelectedOnPage}
                      indeterminate={someSelectedOnPage}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell align="center">#</TableCell>
                  <TableCell align="center">
                    <Button
                      onClick={() => handleSort("booking_id")}
                      endIcon={
                        sortField === "booking_id" ? (
                          sortOrder === "asc" ? (
                            <ArrowUpwardIcon fontSize="small" />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" />
                          )
                        ) : null
                      }
                    >
                      Booking ID
                    </Button>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      onClick={() => handleSort("booking_date")}
                      endIcon={
                        sortField === "booking_date" ? (
                          sortOrder === "asc" ? (
                            <ArrowUpwardIcon fontSize="small" />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" />
                          )
                        ) : null
                      }
                    >
                      Booking Date
                    </Button>
                  </TableCell>
                  <TableCell align="center">Guide ID</TableCell>
                  <TableCell align="justify">Guide Name</TableCell>
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
                        <TableCell align="justify">
                          {booking.first_name} {booking.last_name}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            onClick={() =>
                              handleAssignGuide(bookingId, booking.guide_id)
                            }
                          >
                            Assign
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

export default PendingBookings;
