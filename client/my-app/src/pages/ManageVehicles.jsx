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
  FormControlLabel,
  Switch,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import axiosInstance from "../api/axiosInstance";

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
  const apiUrl = import.meta.env.VITE_API_URL;
  const adminId = userId;;

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

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus =
      currentStatus === "Functional" ? "Suspended" : "Functional";

    axiosInstance
      .patch(`${apiUrl}/api/vehicles/status/${id}`, { status: newStatus })
      .then(() => {
        setVehicles((prev) =>
          prev.map((vehicle) =>
            vehicle.vehicle_id === id
              ? { ...vehicle, status: newStatus }
              : vehicle
          )
        );
      })
      .catch((error) => {
        setError("Error updating status: " + error.message);
      });
  };

  const handleBulkStatusChange = (newStatus) => {
    const updatePromises = selectedIds.map((id) =>
      axios.patch(`${apiUrl}/api/vehicles/status/${id}`, { status: newStatus })
    );

    Promise.all(updatePromises)
      .then(() => {
        setVehicles((prev) =>
          prev.map((vehicle) =>
            selectedIds.includes(vehicle.vehicle_id)
              ? { ...vehicle, status: newStatus }
              : vehicle
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="mb-4 mt-4">
        <h1>Manage Vehicles</h1>
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
            onClick={() => handleBulkStatusChange("Functional")}
            disabled={selectedIds.length === 0}
          >
            Set to Functional
          </Button>
        </div>

        <div style={{ minWidth: "150px" }}>
          <Button
            fullWidth
            variant="contained"
            color="warning"
            onClick={() => handleBulkStatusChange("Suspended")}
            disabled={selectedIds.length === 0}
          >
            Set to Suspended
          </Button>
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {/* Checkbox for selecting all rows */}
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
              {/* vehicle Id  */}
              <TableCell align="center">
                <Button
                  onClick={() => handleSort("vehicle_id")}
                  endIcon={
                    sortConfig.key === "vehicle_id" &&
                    sortConfig.order === "asc" ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )
                  }
                >
                  Vehicle ID
                </Button>
              </TableCell>
              {/* Manufacture */}
              <TableCell align="center">
                <Button
                  onClick={() => handleSort("brand")}
                  endIcon={
                    sortConfig.key === "brand" && sortConfig.order === "asc" ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )
                  }
                >
                  Manufacture
                </Button>
              </TableCell>
              {/* Model */}
              <TableCell align="center">
                <Button
                  onClick={() => handleSort("model")}
                  endIcon={
                    sortConfig.key === "model" && sortConfig.order === "asc" ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )
                  }
                >
                  Model
                </Button>
              </TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedVehicles.length > 0 ? (
              sortedVehicles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((vehicle, index) => (
                  <TableRow key={vehicle.vehicle_id}>
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
                    <TableCell style={{ minWidth: 150 }} align="center">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={vehicle.status === "Functional"}
                            onChange={() =>
                              handleToggleStatus(
                                vehicle.vehicle_id,
                                vehicle.status
                              )
                            }
                            color="primary"
                          />
                        }
                        label={vehicle.status}
                      />
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
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
    </div>
  );
};

export default ManageVehicles;
