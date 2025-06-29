import React, { useEffect, useState } from "react";
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
  Checkbox,
  Chip,
  Box,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axiosInstance from "../api/axiosInstance";
import { format } from "date-fns";

const ManageVehicles = ({ userId }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({
    key: "vehicle_id",
    order: "asc",
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [suspendStartDate, setSuspendStartDate] = useState(null);
  const [suspendEndDate, setSuspendEndDate] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const apiUrl = import.meta.env.VITE_API_URL;
  const adminId = userId;

  useEffect(() => {
    axiosInstance
      .get(`${apiUrl}/api/vehicles/manage/${adminId}`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setVehicles(response.data);
        } else {
          setVehicles([]);
          setError(response.data.message || "Unexpected response structure");
        }
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching vehicles: " + error.message);
        setLoading(false);
      });
  }, []);

  const handleBulkStatusChange = (newStatus) => {
    if (newStatus === "Suspended") {
      if (!suspendStartDate || !suspendEndDate) {
        setSnackbarMessage(
          "Please select both start and end dates for suspension."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      if (suspendEndDate < suspendStartDate) {
        setSnackbarMessage("End date cannot be before start date.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
    }

    const formattedStartDate = suspendStartDate
      ? format(suspendStartDate, "yyyy-MM-dd")
      : null;
    const formattedEndDate = suspendEndDate
      ? format(suspendEndDate, "yyyy-MM-dd")
      : null;

    const updatePromises = selectedIds.map((id) =>
      axiosInstance.patch(`${apiUrl}/api/vehicles/status/${id}`, {
        status: newStatus,
        suspend_start_date:
          newStatus === "Suspended" ? formattedStartDate : null,
        suspend_end_date: newStatus === "Suspended" ? formattedEndDate : null,
      })
    );

    Promise.all(updatePromises)
      .then((responses) => {
        setVehicles((prev) =>
          prev.map((vehicle) =>
            selectedIds.includes(vehicle.vehicle_id)
              ? {
                  ...vehicle,
                  status: newStatus,
                  suspend_start_date:
                    newStatus === "Suspended" ? formattedStartDate : null,
                  suspend_end_date:
                    newStatus === "Suspended" ? formattedEndDate : null,
                }
              : vehicle
          )
        );
        setSelectedIds([]);
        setSuspendStartDate(null);
        setSuspendEndDate(null);
        setError(null);
        setSnackbarMessage("Vehicle statuses updated successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackbarMessage(
          "Error updating multiple statuses: " + error.message
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = sortedVehicles.map((vehicle) => vehicle.vehicle_id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const sortedVehicles = [...(vehicles || [])].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortConfig.order === "asc" ? aVal - bVal : bVal - aVal;
    }

    const valA = aVal?.toString().toLowerCase() || "";
    const valB = bVal?.toString().toLowerCase() || "";

    if (valA < valB) return sortConfig.order === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.order === "asc" ? 1 : -1;
    return 0;
  });

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <Snackbar
        open={true}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div>
        <div className="mb-4 mt-4">
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Manage Vehicles
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "gray" }}>
            Manage and update vehicle information
          </Typography>
        </div>
        {/* Date pickers and buttons for bulk actions */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            margin: "16px",
            alignItems: "center",
          }}
        >
          <Box sx={{ minWidth: "150px" }}>
            <DatePicker
              label="Suspension Start Date"
              value={suspendStartDate}
              onChange={(newValue) => setSuspendStartDate(newValue)}
              minDate={new Date()}
              slotProps={{ textField: { size: "small" } }}
            />
          </Box>
          <Box sx={{ minWidth: "150px" }}>
            <DatePicker
              label="Suspension End Date"
              value={suspendEndDate}
              onChange={(newValue) => setSuspendEndDate(newValue)}
              minDate={suspendStartDate || new Date()}
              slotProps={{ textField: { size: "small" } }}
            />
          </Box>
          <Box sx={{ minWidth: "150px" }}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={() => handleBulkStatusChange("Functional")}
              disabled={selectedIds.length === 0}
            >
              Set to Functional
            </Button>
          </Box>
          <Box sx={{ minWidth: "150px" }}>
            <Button
              fullWidth
              variant="contained"
              color="warning"
              onClick={() => handleBulkStatusChange("Suspended")}
              disabled={selectedIds.length === 0}
            >
              Set to Suspended
            </Button>
          </Box>
        </Box>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === sortedVehicles.length
                    }
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < sortedVehicles.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>#</TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    onClick={() => handleSort("vehicle_id")}
                    endIcon={
                      sortConfig.key === "vehicle_id" &&
                      sortConfig.order === "asc"
                        ? "⬆️"
                        : "⬇️"
                    }
                  >
                    Vehicle ID
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    onClick={() => handleSort("brand")}
                    endIcon={
                      sortConfig.key === "brand" && sortConfig.order === "asc"
                        ? "⬆️"
                        : "⬇️"
                    }
                  >
                    Manufacture
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    onClick={() => handleSort("model")}
                    endIcon={
                      sortConfig.key === "model" && sortConfig.order === "asc"
                        ? "⬆️"
                        : "⬇️"
                    }
                  >
                    Model
                  </Button>
                </TableCell>
                <TableCell align="center">Vehicle Type</TableCell>
                <TableCell align="center">Fuel Type</TableCell>
                <TableCell align="center">Air Condition</TableCell>
                <TableCell align="center">No Plate</TableCell>
                <TableCell align="center">Seat/Luggage Capacity</TableCell>
                <TableCell align="center">Service Due Date</TableCell>
                <TableCell align="center">Service End Date</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedVehicles.length > 0 ? (
                sortedVehicles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((vehicle, index) => (
                    <TableRow
                      key={vehicle.vehicle_id}
                      sx={{
                        "&:hover td": {
                          backgroundColor: "#e3f2fd !important",
                        },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(vehicle.vehicle_id)}
                          onChange={() => handleSelectRow(vehicle.vehicle_id)}
                        />
                      </TableCell>
                      <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                      <TableCell align="center">{vehicle.vehicle_id}</TableCell>
                      <TableCell align="center">{vehicle.brand}</TableCell>
                      <TableCell align="center">{vehicle.model}</TableCell>
                      <TableCell align="center">
                        {vehicle.vehicle_type}
                      </TableCell>
                      <TableCell align="center">{vehicle.fuel_type}</TableCell>
                      <TableCell align="center">
                        {vehicle.air_condition ? "✅" : "❌"}
                      </TableCell>
                      <TableCell align="center">
                        {vehicle.number_plate}
                      </TableCell>
                      <TableCell align="center">
                        {vehicle.seat_capacity} / {vehicle.luggage_capacity}L
                      </TableCell>
                      <TableCell align="center">
                        {vehicle.suspend_start_date
                          ? format(
                              new Date(vehicle.suspend_start_date),
                              "dd/MM/yyyy"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        {vehicle.suspend_end_date
                          ? format(
                              new Date(vehicle.suspend_end_date),
                              "dd/MM/yyyy"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell style={{ minWidth: 150 }} align="center">
                        <Chip
                          label={vehicle.status}
                          size="small"
                          sx={{
                            backgroundColor:
                              vehicle.status === "Functional"
                                ? "green"
                                : "orange",
                            color: "white",
                            fontWeight: 400,
                            fontSize: "0.8rem",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    No vehicles found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[8, 10, 25]}
          component="div"
          count={vehicles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </LocalizationProvider>
  );
};

export default ManageVehicles;
