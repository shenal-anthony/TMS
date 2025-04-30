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
  Switch,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

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
      })
      .catch((error) => {
        setError("Error deleting guide: " + error.message);
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
      })
      .catch((error) => {
        setError("Error deleting selected guides: " + error.message);
      });
  };

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "In Leave" : "Active";

    axios
      .patch(`${apiUrl}/api/guides/status/${id}`, { status: newStatus })
      .then(() => {
        setGuides((prev) =>
          prev.map((guide) =>
            guide.user_id === id ? { ...guide, status: newStatus } : guide
          )
        );
      })
      .catch((error) => {
        setError("Error updating status: " + error.message);
      });
  };

  const handleBulkStatusChange = (newStatus) => {
    const updatePromises = selectedIds.map((id) =>
      axios.patch(`${apiUrl}/api/guides/status/${id}`, { status: newStatus })
    );

    Promise.all(updatePromises)
      .then(() => {
        setGuides((prev) =>
          prev.map((guide) =>
            selectedIds.includes(guide.user_id)
              ? { ...guide, status: newStatus }
              : guide
          )
        );
        setSelectedIds([]);
      })
      .catch((error) => {
        setError("Error updating multiple statuses: " + error.message);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="m-4">
        <h1>Guide List</h1>
      </div>
      {/* buttons for bulk actions */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          margin: "16px",
        }}
      >
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
        <Table>
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
                    sortConfig.key === "user_id" &&
                    sortConfig.order === "asc" ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )
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
                    sortConfig.order === "asc" ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )
                  }
                >
                  Guide Name
                </Button>
              </TableCell>
              <TableCell align="center">Vehicle</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedGuides
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((guide, index) => (
                <TableRow key={guide.user_id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(guide.user_id)}
                      onChange={() => handleSelectRow(guide.user_id)}
                    />
                  </TableCell>
                  <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                  <TableCell>{guide.user_id}</TableCell>
                  <TableCell>{`${guide.first_name} ${guide.last_name}`}</TableCell>
                  <TableCell>{guide.email_address}</TableCell>
                  <TableCell style={{ minWidth: 150 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={guide.status === "Active"}
                          onChange={() =>
                            handleToggleStatus(guide.user_id, guide.status)
                          }
                          color="primary"
                        />
                      }
                      label={guide.status}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
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
    </div>
  );
};

export default GuideAvailability;
