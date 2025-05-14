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
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";

const Packages = () => {
  const [packageSortDirection, setPackageSortDirection] = useState("asc");
  const [destinations, setDestinations] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [packageContents, setPackageContents] = useState([]);
  const [packageLoading, setPackageLoading] = useState(true);
  const [packageError, setPackageError] = useState(null);
  const [packagePage, setPackagePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [openPackageDialog, setOpenPackageDialog] = useState(false);
  const [isEditingPackage, setIsEditingPackage] = useState(false);
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
    if (openPackageDialog) {
      validatePackageForm();
    }
    fetchDestinations();
    fetchAccommodations();
    fetchPackages();
  }, [currentPackage, openPackageDialog]);

  const fetchAccommodations = () => {
    axios
      .get(`${apiUrl}/api/contents/accommodations`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setAccommodations(response.data);
        } else {
          setPackageError("Response data is not an array");
        }
        setPackageLoading(false);
      })
      .catch((packageError) => {
        setPackageError(
          "Error fetching accommodations: " + packageError.message
        );
        setPackageLoading(false);
      });
  };

  const fetchDestinations = () => {
    axios
      .get(`${apiUrl}/api/contents/destinations`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setDestinations(response.data);
        } else {
          setPackageError("Response data is not an array");
        }
        setPackageLoading(false);
      })
      .catch((error) => {
        setPackageError("Error fetching destinations: " + error.message);
        setPackageLoading(false);
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
        setPackageError("Error fetching packages: " + packageError.message);
        setPackageLoading(false);
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

  const handleAddOrUpdatePackage = () => {
    const errors = validatePackageForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const packageData = {
      package_name: currentPackage.packageName,
      description: currentPackage.description,
      price: parseFloat(currentPackage.price),
      duration: parseInt(currentPackage.duration),
      destination_id: currentPackage.destinationId,
      accommodation_id: currentPackage.accommodationId,
    };

    if (isEditingPackage) {
      axios
        .patch(
          `${apiUrl}/api/contents/packages/${currentPackage.package_id}`,
          packageData
        )
        .then((response) => {
          setPackageContents(
            packageContents.map((pkg) =>
              pkg.package_id === currentPackage.package_id ? response.data : pkg
            )
          );
          setOpenPackageDialog(false);
          resetPackageForm();
          setFormErrors({});
        })
        .catch((error) => {
          setPackageError("Error updating package: " + error.message);
          if (error.response?.data?.errors) {
            setFormErrors(error.response.data.errors);
          }
        });
    } else {
      axios
        .post(`${apiUrl}/api/contents/packages`, packageData)
        .then((response) => {
          setPackageContents([...packageContents, response.data]);
          setOpenPackageDialog(false);
          resetPackageForm();
          setFormErrors({});
        })
        .catch((error) => {
          setPackageError("Error adding package: " + error.message);
          if (error.response?.data?.errors) {
            setFormErrors(error.response.data.errors);
          }
        });
    }
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

  const validatePackageForm = () => {
    const errors = {};
    setFormErrors({});

    if (!currentPackage.packageName?.trim()) {
      errors.packageName = "Package name is required";
    }

    if (!currentPackage.description?.trim()) {
      errors.description = "Description is required";
    }

    if (currentPackage.price === undefined || currentPackage.price === "") {
      errors.price = "Price is required";
    } else if (isNaN(currentPackage.price)) {
      errors.price = "Price must be a number";
    } else if (currentPackage.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    if (
      currentPackage.duration === undefined ||
      currentPackage.duration === ""
    ) {
      errors.duration = "Duration is required";
    } else if (isNaN(currentPackage.duration)) {
      errors.duration = "Duration must be a number";
    } else if (currentPackage.duration <= 0) {
      errors.duration = "Duration must be at least 30 minutes";
    }

    if (!currentPackage.destinationId) {
      errors.destinationId = "Please select a destination";
    }

    if (!currentPackage.accommodationId) {
      errors.accommodationId = "Please select an accommodation";
    }

    return errors;
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

  const handlePackagePageChange = (event, newPage) => {
    setPackagePage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPackagePage(0);
  };

  const sortPackagesById = () => {
    const sorted = [...packageContents].sort((a, b) => {
      return packageSortDirection === "asc"
        ? a.package_id - b.package_id
        : b.package_id - a.package_id;
    });
    setPackageContents(sorted);
    setPackageSortDirection(packageSortDirection === "asc" ? "desc" : "asc");
  };

  if (packageLoading) return <div>Loading...</div>;
  if (packageError) return <div>{packageError}</div>;

  return (
    <div>
      <div className="mb-4 mt-4">
        <Typography variant="h5">Package List</Typography>
        <div className="mt-4">
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              resetPackageForm();
              setOpenPackageDialog(true);
            }}
          >
            Add New Package
          </Button>
        </div>
      </div>

      <Dialog
        open={openPackageDialog}
        onClose={() => {
          setOpenPackageDialog(false);
          resetPackageForm();
          setFormErrors({});
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 1 }}>
          {isEditingPackage
            ? "Edit Travel Package"
            : "Create New Travel Package"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Package Name *"
              size="small"
              fullWidth
              value={currentPackage.packageName}
              onChange={(e) => {
                setCurrentPackage({
                  ...currentPackage,
                  packageName: e.target.value,
                });
                validatePackageForm();
              }}
              error={!!formErrors.packageName}
              helperText={formErrors.packageName}
            />
            <TextField
              margin="dense"
              label="Description *"
              size="small"
              fullWidth
              multiline
              minRows={3}
              value={currentPackage.description}
              onChange={(e) => {
                setCurrentPackage({
                  ...currentPackage,
                  description: e.target.value,
                });
                validatePackageForm();
              }}
              error={!!formErrors.description}
              helperText={formErrors.description}
            />
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                margin="dense"
                label="Price (LKR) *"
                size="small"
                fullWidth
                type="number"
                value={currentPackage.price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setCurrentPackage({
                    ...currentPackage,
                    price: isNaN(value) ? "" : value,
                  });
                  validatePackageForm();
                }}
                error={!!formErrors.price}
                helperText={formErrors.price || "Enter a positive number"}
              />
              <TextField
                margin="dense"
                label="Duration (minutes) *"
                size="small"
                fullWidth
                type="number"
                value={currentPackage.duration}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setCurrentPackage({
                    ...currentPackage,
                    duration: isNaN(value) ? "" : value,
                  });
                  validatePackageForm();
                }}
                error={!!formErrors.duration}
                helperText={formErrors.duration || "Minimum 30 minutes"}
              />
            </Box>
            <FormControl
              fullWidth
              size="small"
              margin="dense"
              error={!!formErrors.destinationId}
            >
              <InputLabel>Destination *</InputLabel>
              <Select
                value={currentPackage.destinationId || ""}
                label="Destination *"
                onChange={(e) =>
                  setCurrentPackage({
                    ...currentPackage,
                    destinationId: e.target.value,
                  })
                }
              >
                {destinations.map((destination) => (
                  <MenuItem
                    key={destination.destination_id}
                    value={destination.destination_id}
                  >
                    {destination.destination_id}. {destination.destination_name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.destinationId && (
                <FormHelperText>{formErrors.destinationId}</FormHelperText>
              )}
            </FormControl>
            <FormControl
              fullWidth
              size="small"
              margin="dense"
              error={!!formErrors.accommodationId}
            >
              <InputLabel>Accommodation *</InputLabel>
              <Select
                value={currentPackage.accommodationId || ""}
                label="Accommodation *"
                onChange={(e) =>
                  setCurrentPackage({
                    ...currentPackage,
                    accommodationId: e.target.value,
                  })
                }
              >
                {accommodations.map((accom) => (
                  <MenuItem
                    key={accom.accommodation_id}
                    value={accom.accommodation_id}
                  >
                    id:{accom.accommodation_id}. {accom.accommodation_name} -{" "}
                    {accom.accommodation_type}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.accommodationId && (
                <FormHelperText>{formErrors.accommodationId}</FormHelperText>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            size="small"
            onClick={() => {
              setOpenPackageDialog(false);
              resetPackageForm();
              setFormErrors({});
            }}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            onClick={handleAddOrUpdatePackage}
            color="primary"
            variant="contained"
            sx={{ textTransform: "none" }}
            disabled={
              !currentPackage.packageName ||
              !currentPackage.description ||
              !currentPackage.price ||
              !currentPackage.duration ||
              !currentPackage.destinationId ||
              !currentPackage.accommodationId
            }
          >
            {isEditingPackage ? "Save Changes" : "Create Package"}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell align="center">
                <Button
                  onClick={sortPackagesById}
                  endIcon={packageSortDirection === "asc" ? " ⬆️" : " ⬇️"}
                >
                  Package ID
                </Button>
              </TableCell>
              <TableCell align="center">Package Name</TableCell>
              <TableCell align="center">Duration</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packageContents.length > 0 ? (
              packageContents
                .slice(
                  packagePage * rowsPerPage,
                  packagePage * rowsPerPage + rowsPerPage
                )
                .map((pkg, index) => (
                  <TableRow
                    key={pkg.package_id}
                    sx={{
                      "&:hover td": {
                        backgroundColor: "#e3f2fd !important",
                      },
                    }}
                  >
                    <TableCell align="center">
                      {index + 1 + packagePage * rowsPerPage}
                    </TableCell>
                    <TableCell align="center">{pkg.package_id}</TableCell>
                    <TableCell align="center">{pkg.package_name}</TableCell>
                    <TableCell align="center">{pkg.duration}</TableCell>
                    <TableCell
                      align="center"
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEditPackage(pkg)}
                      >
                        Update
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
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

      <TablePagination
        rowsPerPageOptions={[8, 10, 25]}
        component="div"
        count={packageContents.length}
        rowsPerPage={rowsPerPage}
        page={packagePage}
        onPageChange={handlePackagePageChange}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default Packages;
