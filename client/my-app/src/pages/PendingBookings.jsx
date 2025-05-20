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
  Select,
  MenuItem,
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
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("closest");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState({}); // Track selected vehicle per row

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
      setSelectedVehicles({}); // Reset vehicle selections
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
      const res = await axios.get(`${apiUrl}/api/bookings/pending`, {
        params: {
          startDate: dayjs(startDate).format("YYYY-MM-DD"),
          endDate: dayjs(endDate).format("YYYY-MM-DD"),
        },
      });
      setGroupedBookings(groupByBooking(res.data));
      setSelectedVehicles({}); // Reset vehicle selections
      setLoading(false);
      setError(null);
    } catch (err) {
      setError("Error fetching filtered bookings: " + err.message);
      setLoading(false);
    }
  };

  const handleAssignGuideAndVehicle = (bookingId, guideId, vehicleId) => {
    if (
      window.confirm(
        `Are you sure you want to assign guide ${guideId}${
          vehicleId ? ` and vehicle ${vehicleId}` : " without a vehicle"
        }?`
      )
    ) {
      axios
        .put(`${apiUrl}/api/bookings/${bookingId}/assign`, {
          guideId,
          vehicleId,
        })
        .then(() => {
          const updated = { ...groupedBookings };
          delete updated[bookingId];
          setGroupedBookings(updated);
          setSelectedIds((prev) => prev.filter((id) => id !== bookingId));
          setSelectedVehicles((prev) => {
            const updated = { ...prev };
            delete updated[`${bookingId}-${guideId}`];
            return updated;
          });
          setError(null);
        })
        .catch((error) => {
          setError("Error assigning guide/vehicle: " + error.message);
        });
    }
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
      setSelectedIds(sortedBookingIds);
    } else {
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
    const today = new Date();
    if (sortField === "booking_id") {
      return sortOrder === "asc" ? a - b : b - a;
    } else if (sortField === "booking_date") {
      const dateA = new Date(groupedBookings[a][0].booking_date);
      const dateB = new Date(groupedBookings[b][0].booking_date);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "closest") {
      const dateA = new Date(groupedBookings[a][0].booking_date);
      const dateB = new Date(groupedBookings[b][0].booking_date);
      const diffA = Math.abs(today - dateA);
      const diffB = Math.abs(today - dateB);
      return sortOrder === "asc" ? diffA - diffB : diffB - diffA;
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

  const handleVehicleChange = (bookingId, guideId, vehicleId) => {
    setSelectedVehicles((prev) => ({
      ...prev,
      [`${bookingId}-${guideId}`]: vehicleId === "null" ? null : vehicleId,
    }));
  };

  const bookingIds = Object.keys(groupedBookings);

  const allSelectedOnPage =
    paginatedIds.length > 0 &&
    paginatedIds.every((id) => selectedIds.includes(id));

  const someSelectedOnPage =
    paginatedIds.some((id) => selectedIds.includes(id)) && !allSelectedOnPage;

  return (
    <div>
      <div className="mb-4 mt-1">
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Pending Bookings
        </Typography>
        <Typography>
          You've got pending work—assign guides and vehicles to keep tours on
          track.
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
            <Table size="small">
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
                        sortField === "booking_id" && sortOrder === "asc"
                          ? "⬆️"
                          : "⬇️"
                      }
                    >
                      Booking ID
                    </Button>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      onClick={() => handleSort("booking_date")}
                      endIcon={
                        sortField === "booking_date" && sortOrder === "asc"
                          ? "⬆️"
                          : "⬇️"
                      }
                    >
                      Booking Date
                    </Button>
                  </TableCell>
                  <TableCell align="center">Guide ID</TableCell>
                  <TableCell align="justify">Available Guide Name</TableCell>
                  <TableCell align="center">Vehicle</TableCell>
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
                        sx={{
                          backgroundColor:
                            (paginatedIds.indexOf(bookingId) +
                              page * rowsPerPage) %
                              2 ===
                            0
                              ? "#f7f8f8"
                              : "inherit",
                          "&:hover td": {
                            backgroundColor: "#e3f2fd",
                          },
                        }}
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
                          <Select
                            value={
                              selectedVehicles[
                                `${bookingId}-${booking.guide_id}`
                              ] ?? "null"
                            }
                            onChange={(e) =>
                              handleVehicleChange(
                                bookingId,
                                booking.guide_id,
                                e.target.value
                              )
                            }
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 200, // Limit height to 200px
                                  overflowY: "auto", // Enable vertical scroll
                                },
                              },
                            }}
                            size="small"
                            displayEmpty
                            sx={{ minWidth: 200, fontSize: "1rem" }}
                            renderValue={(selected) => {
                              if (selected === "null") {
                                return (
                                  <p
                                    style={{ color: "#888", fontSize: "small" }}
                                  >
                                    No Vehicle
                                  </p>
                                );
                              }

                              const selectedVehicle = booking.vehicles.find(
                                (v) => v.vehicle_id === selected
                              );

                              return selectedVehicle ? (
                                <span>
                                  {`${selectedVehicle.vehicle_id} - ${selectedVehicle.brand} ${selectedVehicle.model}`}
                                </span>
                              ) : (
                                selected
                              );
                            }}
                          >
                            <MenuItem value="null">
                              <p>No Vehicle</p>
                            </MenuItem>
                            {booking.vehicles.map((vehicle) => (
                              <MenuItem
                                key={vehicle.vehicle_id || "null"}
                                value={vehicle.vehicle_id || "null"}
                                sx={{ fontSize: "1rem" }}
                              >
                                {vehicle.vehicle_id
                                  ? `${vehicle.vehicle_id} - ${vehicle.brand} ${vehicle.model} (${vehicle.vehicle_type})`
                                  : "None"}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() =>
                              handleAssignGuideAndVehicle(
                                bookingId,
                                booking.guide_id,
                                selectedVehicles[
                                  `${bookingId}-${booking.guide_id}`
                                ]
                              )
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
            rowsPerPageOptions={[3, 5, 8]}
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
