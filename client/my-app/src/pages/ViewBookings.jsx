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
// import { Table } from "@mui/joy";

const ViewBookings = () => {
  const [destinationContents, setDestinationContents] = useState([]);
  const [packageContents, setPackageContents] = useState([]);

  const [destinationloading, setDestinationLoading] = useState(true);
  const [packageLoading, setPackageLoading] = useState(true);

  const [destinationError, setDestinationError] = useState(null);
  const [packageError, setPackageError] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const [openDialog, setOpenDialog] = useState(false);
  const [openPackageDialog, setOpenPackageDialog] = useState(false);

  const [isEditingDestination, setIsEditing] = useState(false);
  const [isEditingPackage, setIsEditingPackage] = useState(false);

  const [currentDestination, setCurrentDestination] = useState({
    destinationName: "",
    description: "",
    weatherCondition: "",
    locationUrl: "",
    pictureUrl: "",
  });
  const [currentPackage, setCurrentPackage] = useState({
    packageName: "",
    description: "",
    price: "",
    duration: "",
    accommodationId: "",
    destinationId: "",
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // fetchDestinations();
    fetchPackages();
  }, []);

  const fetchDestinations = () => {
    axios
      .get(`${apiUrl}/api/tourists/destinations`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setDestinationContents(response.data);
        } else {
          setDestinationError("Response data is not an array");
        }
        setDestinationLoading(false);
      })
      .catch((destinationError) => {
        setDestinationError(
          "Error fetching destinationContents: " + destinationError.message
        );
        setDestinationLoading(false);
      });
  };

  const fetchPackages = () => {
    axios
      .get(`${apiUrl}/api/tourists/packages`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setPackageContents(response.data);
        } else {
          setPackageError("Response data is not an array");
        }
        setPackageLoading(false);
      })
      .catch((packageError) => {
        setPackageError(
          "Error fetching destinationContents: " + packageError.message
        );
        setPackageLoading(false);
      });
  };

  const handleRemoveDestination = (id) => {
    axios
      .delete(`${apiUrl}/api/tourists/destinations/${id}`)
      .then(() => {
        setDestinationContents(
          destinationContents.filter(
            (destination) => destination.destination_id !== id
          )
        );
      })
      .catch((destinationError) => {
        setDestinationError(
          "Error deleting destination: " + destinationError.message
        );
      });
  };

  const handleRemovePackage = (id) => {
    axios
      .delete(`${apiUrl}/api/tourists/packages/${id}`)
      .then(() => {
        setPackageContents(
          packageContents.filter((pkg) => pkg.package_id !== id)
        );
      })
      .catch((packageError) => {
        setPackageError("Error deleting package: " + packageError.message);
      });
  };

  const handleAddOrUpdateDestination = () => {
    if (isEditingDestination) {
      // Update existing destination
      axios
        .put(
          `${apiUrl}/api/tourists/destinations/${currentDestination.destination_id}`,
          currentDestination
        )
        .then((response) => {
          setDestinationContents(
            destinationContents.map((destination) =>
              destination.destination_id === currentDestination.destination_id
                ? response.data
                : destination
            )
          );
          setOpenDialog(false);
          resetForm();
        })
        .catch((destinationError) => {
          setDestinationError(
            "Error updating destination: " + destinationError.message
          );
        });
    } else {
      // Add new destination
      axios
        .post(`${apiUrl}/api/tourists/destinations`, currentDestination)
        .then((response) => {
          setDestinationContents([...destinationContents, response.data]);
          setOpenDialog(false);
          resetForm();
        })
        .catch((destinationError) => {
          setDestinationError(
            "Error adding destination: " + destinationError.message
          );
        });
    }
  };

  const handleAddOrUpdatePackage = () => {
    if (isEditingPackage) {
      // Update existing package
      axios
        .put(
          `${apiUrl}/api/tourists/packages/${currentPackage.package_id}`,
          currentPackage
        )
        .then((response) => {
          setPackageContents(
            packageContents.map((pkg) =>
              pkg.package_id === currentPackage.package_id ? response.data : pkg
            )
          );
          setOpenDialog(false);
          resetPackageForm();
        })
        .catch((packageError) => {
          setPackageError(
            "Error updating destination: " + packageError.message
          );
        });
    } else {
      // Add new package
      axios
        .post(`${apiUrl}/api/tourists/packages`, currentPackage)
        .then((response) => {
          setPackageContents([...packageContents, response.data]);
          setOpenPackageDialog(false);
          resetPackageForm();
        })
        .catch((packageError) => {
          setPackageError("Error adding destination: " + packageError.message);
        });
    }
  };

  const handleEditDestination = (destination) => {
    setCurrentDestination({
      destination_id: destination.destination_id,
      destinationName: destination.destination_name,
      description: destination.description,
      weatherCondition: destination.weather_condition,
      locationUrl: destination.location_url,
      pictureUrl: destination.picture_url,
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleEditPackage = (pkg) => {
    setCurrentPackage({
      package_id: pkg.package_id,
      packageName: pkg.package_name,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
      accommodationId: pkg.accommodation_id,
      destinationId: pkg.destination_id,
    });
    setIsEditingPackage(true);
    setOpenPackageDialog(true);
  };

  const resetForm = () => {
    setCurrentDestination({
      destinationName: "",
      description: "",
      weatherCondition: "",
      locationUrl: "",
      pictureUrl: "",
    });
    setIsEditing(false);
  };

  const resetPackageForm = () => {
    setCurrentPackage({
      packageName: "",
      description: "",
      price: "",
      duration: "",
      accommodationId: "",
      destinationId: "",
    });
    setIsEditingPackage(false);
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
                <TableCell>Booking ID</TableCell>
                <TableCell>Check Out Date</TableCell>
                <TableCell>Guide</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packageContents.length > 0 ? (
                packageContents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((pkg) => (
                    <TableRow
                      key={pkg.package_id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                          cursor: "default",
                        },
                      }}
                    >
                      <TableCell>{pkg.package_id}</TableCell>
                      <TableCell>{pkg.package_name}</TableCell>
                      <TableCell>{pkg.duration}</TableCell>
                      <TableCell>{pkg.duration}</TableCell>
                      <TableCell style={{ display: "flex" }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleEditPackage(pkg)}
                        >
                          Update
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleRemovePackage(pkg.package_id)}
                          style={{ marginLeft: "10px" }}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
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
          count={packageContents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </div>
  );
};

export default ViewBookings;
