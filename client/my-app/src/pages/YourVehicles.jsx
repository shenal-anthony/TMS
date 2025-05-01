import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
} from "@mui/material";

const YourVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleRegister = () => {
    navigate("/vehicleRegisterForm");
  };

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get the token from local storage

    if (!token) {
      setError("No token found");
      setLoading(false);
      return;
    }

    axios
      .get(`${apiUrl}/api/vehicles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setVehicles(response.data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setVehicles([]);
        } else {
          setError("Error fetching vehicles: " + error.message);
        }
        setLoading(false);
      });
  }, []);

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVehicle(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="mb-4 mt-4">
        <Typography variant="h4" color="intial">
          Your Vehicles
        </Typography>
        <h1 className="ml-2">View your vehicles here</h1>
      </div>
      <div className="mb-4">
        <Button variant="contained" color="primary" onClick={handleRegister}>
          Register vehicle
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell align="center">Vehicle ID</TableCell>
              <TableCell align="center">Manufacture</TableCell>
              <TableCell align="center">Model</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.length > 0 ? (
              vehicles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((vehicle) => (
                  <TableRow
                    key={vehicle.vehicle_id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        cursor: "default",
                      },
                    }}
                  >
                    {/* serial number */}
                    <TableCell align="center">
                      {page * rowsPerPage + (vehicles.indexOf(vehicle) + 1)}
                    </TableCell>
                    <TableCell align="center">{vehicle.vehicle_id}</TableCell>
                    <TableCell align="center">{vehicle.brand}</TableCell>
                    <TableCell align="center">{vehicle.model}</TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color:
                          vehicle.status === "Functional" ? "green" : "orange",
                      }}
                    >
                      {vehicle.status}
                    </TableCell>
                    {/* action button for view */}
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleViewDetails(vehicle)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
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
      {/* vehicle details dialog  */}
      {selectedVehicle && (
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Vehicle Details</DialogTitle>
          <DialogContent dividers>
            <DialogContentText>
              <strong>Vehicle ID:</strong> {selectedVehicle.vehicle_id}
            </DialogContentText>
            <DialogContentText>
              <strong>Manufacture:</strong> {selectedVehicle.brand}
            </DialogContentText>
            <DialogContentText>
              <strong>Model:</strong> {selectedVehicle.model}
            </DialogContentText>
            <DialogContentText>
              <strong>Color:</strong> {selectedVehicle.color}
            </DialogContentText>
            <DialogContentText>
              <strong>Vehicle Type:</strong> {selectedVehicle.vehicle_type}
            </DialogContentText>
            <DialogContentText>
              <strong>Fuel Type:</strong> {selectedVehicle.fuel_type}
            </DialogContentText>
            <DialogContentText>
              <strong>Air Condition:</strong>{" "}
              {selectedVehicle.air_condition ? "Yes" : "No"}
            </DialogContentText>
            <DialogContentText>
              <strong>Registration Number:</strong>{" "}
              {selectedVehicle.registration_number}
            </DialogContentText>
            <DialogContentText>
              <strong>Number Plate:</strong> {selectedVehicle.number_plate}
            </DialogContentText>
            <DialogContentText>
              <strong>Tourist License Path:</strong>{" "}
              {selectedVehicle.tourist_license}
            </DialogContentText>
            <DialogContentText>
              <strong>Vehicle Picture Path:</strong>{" "}
              {selectedVehicle.vehicle_picture}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default YourVehicles;
