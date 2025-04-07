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

const Destinations = () => {
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
    fetchDestinations();
    fetchPackages();
  }, []);

  const fetchDestinations = () => {
    axios
      .get(`${apiUrl}/api/contents/destinations`)
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
      .get(`${apiUrl}/api/contents/packages`)
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
      .delete(`${apiUrl}/api/contents/destinations/${id}`)
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
      .delete(`${apiUrl}/api/contents/packages/${id}`)
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
          `${apiUrl}/api/contents/destinations/${currentDestination.destination_id}`,
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
        .post(`${apiUrl}/api/contents/destinations`, currentDestination)
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
          `${apiUrl}/api/contents/packages/${currentPackage.package_id}`,
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
        .post(`${apiUrl}/api/contents/packages`, currentPackage)
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

  if (destinationloading) return <div>Loading...</div>;
  if (packageLoading) return <div>Loading...</div>;
  if (destinationError) return <div>{destinationError}</div>;
  if (packageError) return <div>{packageError}</div>;

  return (
    <div>
      {/* Destinations part */}
      <div>
        {/* para part */}
        <div className="mb-4 mt-4">
          <h1>Destination List</h1>
          <div className="mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}
            >
              Add New Destination
            </Button>
          </div>
        </div>

        {/* Add/Edit Destination Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            resetForm();
          }}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {isEditingDestination ? "Edit Destination" : "Add New Destination"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Destination Name"
              fullWidth
              value={currentDestination.destinationName}
              onChange={(e) =>
                setCurrentDestination({
                  ...currentDestination,
                  destinationName: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              value={currentDestination.description}
              onChange={(e) =>
                setCurrentDestination({
                  ...currentDestination,
                  description: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Weather Condition"
              fullWidth
              value={currentDestination.weatherCondition}
              onChange={(e) =>
                setCurrentDestination({
                  ...currentDestination,
                  weatherCondition: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Location URL"
              fullWidth
              value={currentDestination.locationUrl}
              onChange={(e) =>
                setCurrentDestination({
                  ...currentDestination,
                  locationUrl: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Picture URL"
              fullWidth
              value={currentDestination.pictureUrl}
              onChange={(e) =>
                setCurrentDestination({
                  ...currentDestination,
                  pictureUrl: e.target.value,
                })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdateDestination} color="primary">
              {isEditingDestination ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Destinations Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Destination ID</TableCell>
                <TableCell>Destination Name</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {destinationContents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((destination) => (
                  <TableRow
                    key={destination.destination_id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        cursor: "default",
                      },
                    }}
                  >
                    <TableCell>{destination.destination_id}</TableCell>
                    <TableCell>{destination.destination_name}</TableCell>
                    <TableCell style={{ display: "flex" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditDestination(destination)}
                      >
                        Update
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() =>
                          handleRemoveDestination(destination.destination_id)
                        }
                        style={{ marginLeft: "10px" }}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[8, 10, 25]}
          component="div"
          count={destinationContents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>

      {/* Packages part */}
      <div>
        <div className="mb-4 mt-4">
          <hr />
        </div>
        {/* para part */}
        <div className="mb-4 mt-4">
          <h1>Package List</h1>
          <div className="mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                resetPackageForm();
                setOpenPackageDialog(true);
              }}
            >
              Add New Package
            </Button>
          </div>
        </div>

        {/* Add/Edit Package Dialog */}
        <Dialog
          open={openPackageDialog}
          onClose={() => {
            setOpenPackageDialog(false);
            resetPackageForm();
          }}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {isEditingPackage ? "Edit Package" : "Add New Package"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Package Name"
              fullWidth
              value={currentPackage.packageName}
              onChange={(e) =>
                setCurrentPackage({
                  ...currentPackage,
                  packageName: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              value={currentPackage.description}
              onChange={(e) =>
                setCurrentPackage({
                  ...currentPackage,
                  description: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Price"
              fullWidth
              value={currentPackage.price}
              onChange={(e) =>
                setCurrentPackage({
                  ...currentPackage,
                  price: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Duration"
              fullWidth
              value={currentPackage.duration}
              onChange={(e) =>
                setCurrentPackage({
                  ...currentPackage,
                  duration: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Accommodation ID"
              fullWidth
              value={currentPackage.accommodationId}
              onChange={(e) =>
                setCurrentPackage({
                  ...currentPackage,
                  accommodationId: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Destination ID"
              fullWidth
              value={currentPackage.destinationId}
              onChange={(e) =>
                setCurrentPackage({
                  ...currentPackage,
                  destinationId: e.target.value,
                })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenPackageDialog(false);
                resetPackageForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdatePackage} color="primary">
              {isEditingPackage ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Destinations Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Package ID</TableCell>
                <TableCell>Package Name</TableCell>
                <TableCell>Duration</TableCell>
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
                    No packages found
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

export default Destinations;
