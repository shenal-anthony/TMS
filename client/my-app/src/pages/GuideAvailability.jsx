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
  Checkbox,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";

const GuideAvailability = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({
    key: "user_id",
    order: "asc",
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [leaveStartDate, setLeaveStartDate] = useState(null);
  const [leaveEndDate, setLeaveEndDate] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = () => {
    axios
      .get(`${apiUrl}/api/guides`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setGuides(response.data);
        } else {
          setError("Response data is not an array");
        }
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching guides: " + error.message);
        setLoading(false);
      });
  };

  const handleRemove = (id) => {
    if (!window.confirm("Are you sure you want to remove this guide?")) return;

    axios
      .delete(`${apiUrl}/api/guides/${id}`)
      .then(() => {
        setGuides((prev) => prev.filter((guide) => guide.user_id !== id));
        setSelectedIds((prev) => prev.filter((sid) => sid !== id));
        setSnackbarMessage("Guide removed successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setError("Error deleting guide: " + error.message);
        setSnackbarMessage("Error deleting guide: " + error.message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleRemoveSelected = () => {
    if (!window.confirm("Are you sure you want to remove selected guides?"))
      return;

    const deletePromises = selectedIds.map((id) =>
      axios.delete(`${apiUrl}/api/guides/${id}`)
    );

    Promise.all(deletePromises)
      .then(() => {
        setGuides((prev) =>
          prev.filter((guide) => !selectedIds.includes(guide.user_id))
        );
        setSelectedIds([]);
        setSnackbarMessage("Selected guides removed successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setError("Error deleting selected guides: " + error.message);
        setSnackbarMessage("Error deleting selected guides: " + error.message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleBulkStatusChange = (newStatus) => {
    if (newStatus === "In Leave") {
      if (!leaveStartDate || !leaveEndDate) {
        setSnackbarMessage("Please select both start and end dates for leave.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      if (leaveEndDate < leaveStartDate) {
        setSnackbarMessage("End date cannot be before start date.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
    }

    const formattedStartDate = leaveStartDate
      ? format(leaveStartDate, "yyyy-MM-dd")
      : null;
    const formattedEndDate = leaveEndDate
      ? format(leaveEndDate, "yyyy-MM-dd")
      : null;

    const updatePromises = selectedIds.map((id) =>
      axios.patch(`${apiUrl}/api/guides/status/${id}`, {
        status: newStatus,
        leave_due_date: newStatus === "In Leave" ? formattedStartDate : null,
        leave_end_date: newStatus === "In Leave" ? formattedEndDate : null,
      })
    );

    Promise.all(updatePromises)
      .then(() => {
        setGuides((prev) =>
          prev.map((guide) =>
            selectedIds.includes(guide.user_id)
              ? {
                  ...guide,
                  status: newStatus,
                  leave_due_date:
                    newStatus === "In Leave" ? formattedStartDate : null,
                  leave_end_date:
                    newStatus === "In Leave" ? formattedEndDate : null,
                }
              : guide
          )
        );
        setSelectedIds([]);
        setLeaveStartDate(null);
        setLeaveEndDate(null);
        setSnackbarMessage("Guide statuses updated successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackbarMessage(
          error.response?.data?.message ||
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
      const allIds = sortedGuides.map((guide) => guide.user_id);
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

  const sortedGuides = [...guides].sort((a, b) => {
    const valA = a[sortConfig.key]?.toString().toLowerCase();
    const valB = b[sortConfig.key]?.toString().toLowerCase();

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

  if (loading)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}
      >
        <CircularProgress />
      </div>
    );
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
        <div className="m-4">
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Guide List
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "gray" }}>
            Manage and update guide availability
          </Typography>
        </div>
        {/* Date pickers and buttons for bulk actions */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            margin: "16px",
            alignItems: "center",
          }}
        >
          <div style={{ minWidth: "150px" }}>
            <DatePicker
              label="Leave Start Date"
              value={leaveStartDate}
              onChange={(newValue) => setLeaveStartDate(newValue)}
              minDate={new Date()}
              slotProps={{ textField: { size: "small" } }}
            />
          </div>
          <div style={{ minWidth: "150px" }}>
            <DatePicker
              label="Leave End Date"
              value={leaveEndDate}
              onChange={(newValue) => setLeaveEndDate(newValue)}
              minDate={leaveStartDate || new Date()}
              slotProps={{ textField: { size: "small" } }}
              disabled={selectedIds.length === 0}
            />
          </div>
          <div style={{ minWidth: "150px" }}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={() => handleBulkStatusChange("Active")}
              disabled={selectedIds.length === 0}
            >
              Set to Active
            </Button>
          </div>
          <div style={{ minWidth: "150px" }}>
            <Button
              fullWidth
              variant="contained"
              color="warning"
              onClick={() => handleBulkStatusChange("In Leave")}
              disabled={selectedIds.length === 0}
            >
              Set to In Leave
            </Button>
          </div>
          <div style={{ minWidth: "164px" }}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={handleRemoveSelected}
              disabled={selectedIds.length === 0}
            >
              Remove Selected
            </Button>
          </div>
        </div>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === sortedGuides.length
                    }
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < sortedGuides.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell align="center">#</TableCell>
                <TableCell align="center">
                  <Button
                    onClick={() => handleSort("user_id")}
                    endIcon={
                      sortConfig.key === "user_id" && sortConfig.order === "asc"
                        ? "⬆️"
                        : "⬇️"
                    }
                  >
                    Guide ID
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Button
                    onClick={() => handleSort("first_name")}
                    endIcon={
                      sortConfig.key === "first_name" &&
                      sortConfig.order === "asc"
                        ? "⬆️"
                        : "⬇️"
                    }
                  >
                    Guide Name
                  </Button>
                </TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell align="center">Leave Start Date</TableCell>
                <TableCell align="center">Leave End Date</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedGuides
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((guide, index) => (
                  <TableRow
                    key={guide.user_id}
                    sx={{
                      "&:hover td": {
                        backgroundColor: "#e3f2fd !important",
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(guide.user_id)}
                        onChange={() => handleSelectRow(guide.user_id)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {index + 1 + page * rowsPerPage}
                    </TableCell>
                    <TableCell align="center">{guide.user_id}</TableCell>
                    <TableCell align="center">{`${guide.first_name} ${guide.last_name}`}</TableCell>
                    <TableCell align="center">{guide.email_address}</TableCell>
                    <TableCell align="center">
                      {guide.leave_due_date
                        ? format(new Date(guide.leave_due_date), "dd/MM/yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell align="center">
                      {guide.leave_end_date
                        ? format(new Date(guide.leave_end_date), "dd/MM/yyyy")
                        : "N/A"}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={guide.status}
                        size="small"
                        sx={{
                          backgroundColor:
                            guide.status === "Active" ? "green" : "orange",
                          color: "white",
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleRemove(guide.user_id)}
                      >
                        Remove
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
          count={guides.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
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

export default GuideAvailability;
