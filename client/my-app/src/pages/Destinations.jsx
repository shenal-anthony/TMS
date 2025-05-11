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
  Divider,
  FormHelperText,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const Destinations = () => {
  const [destinationSortDirection, setDestinationSortDirection] =
    useState("asc");
  const [packageSortDirection, setPackageSortDirection] = useState("asc");

  const [destinations, setDestinations] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const [destinationContents, setDestinationContents] = useState([]);
  const [packageContents, setPackageContents] = useState([]);

  const [destinationloading, setDestinationLoading] = useState(true);
  const [packageLoading, setPackageLoading] = useState(true);

  const [destinationError, setDestinationError] = useState(null);
  const [packageError, setPackageError] = useState(null);

  const [destinationPage, setDestinationPage] = useState(0);
  const [packagePage, setPackagePage] = useState(0);
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

  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // State to hold the image
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (openPackageDialog) {
      validatePackageForm();
    }
    fetchDestinations();
    fetchAccommodations();
    fetchPackages();
  }, [currentPackage, openPackageDialog]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result); // Set the preview URL
        setCurrentDestination({
          ...currentDestination,
          pictureFile: file, // Store the file for uploading
        });
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

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
          setDestinations;

          setDestinationContents(response.data);
          setDestinations(response.data); // Set destinations for the package dropdown
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
    const formData = new FormData();

    formData.append("destinationName", currentDestination.destinationName);
    formData.append("description", currentDestination.description);
    formData.append("weatherCondition", currentDestination.weatherCondition);
    formData.append("locationUrl", currentDestination.locationUrl);

    // For new or updated file
    if (currentDestination.pictureFile) {
      formData.append("destination", currentDestination.pictureFile); // must match fieldName in MulterMiddleware
    } else if (currentDestination.pictureUrl) {
      formData.append("pictureUrl", currentDestination.pictureUrl);
    }

    const request = isEditingDestination
      ? axios.patch(
          `${apiUrl}/api/contents/destinations/${currentDestination.destination_id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
      : axios.post(`${apiUrl}/api/contents/destinations`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

    request
      .then((response) => {
        fetchDestinations(); // Refresh list
        setOpenDialog(false);
        resetForm();
      })
      .catch((destinationError) => {
        setDestinationError(
          "Error saving destination: " + destinationError.message
        );
      });
  };

  const handleAddOrUpdatePackage = () => {
    // First validate the form
    const errors = validatePackageForm();

    // If there are errors, stop the submission
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare the package data with proper field names
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

  const handleEditDestination = (destination) => {
    setCurrentDestination({
      destination_id: destination.destination_id,
      destinationName: destination.destination_name,
      description: destination.description,
      weatherCondition: destination.weather_condition,
      locationUrl: destination.location_url,
      pictureUrl: destination.picture_url,
    });

    // Set image preview if there is an existing image
    setImagePreviewUrl(destination.picture_url || null);

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

  const validatePackageForm = () => {
    const errors = {};

    // Clear previous errors when validating
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
      errors.duration = "Duration must be at least 30 minute";
    }

    if (!currentPackage.destinationId) {
      errors.destinationId = "Please select a destination";
    }

    if (!currentPackage.accommodationId) {
      errors.accommodationId = "Please select an accommodation";
    }

    return errors;
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

  const handleDestinationPageChange = (event, newPage) => {
    setDestinationPage(newPage);
  };

  const handlePackagePageChange = (event, newPage) => {
    setPackagePage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setDestinationPage(0);
    setPackagePage(0);
  };

  // Add these functions near your other utility functions
  const sortDestinationsById = () => {
    const sorted = [...destinationContents].sort((a, b) => {
      return destinationSortDirection === "asc"
        ? a.destination_id - b.destination_id
        : b.destination_id - a.destination_id;
    });
    setDestinationContents(sorted);
    setDestinationSortDirection(
      destinationSortDirection === "asc" ? "desc" : "asc"
    );
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
          <Typography variant="h5">Destination List</Typography>
          <div className="mt-4">
            <Button
              variant="contained"
              color="primary"
              size="small"
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
          <DialogTitle sx={{ pb: 1 }}>
            {isEditingDestination ? "Edit Destination" : "Add New Destination"}
          </DialogTitle>

          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              <TextField
                autoFocus
                margin="dense"
                size="small"
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
                size="small"
                multiline
                minRows={3}
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
                size="small"
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
                size="small"
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

              {/* Image Upload with Split Layout */}
              <Box
                sx={{
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                  display: "flex",
                  gap: 3,
                  minHeight: 200,
                }}
              >
                {/* Left Side - Upload Controls */}
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <input
                    accept="image/*"
                    id="destination-image-upload"
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                  <label htmlFor="destination-image-upload">
                    <Button
                      size="small"
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload Image
                    </Button>
                  </label>

                  {imagePreviewUrl && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setImagePreviewUrl("")}
                      startIcon={<DeleteIcon />}
                    >
                      Remove Image
                    </Button>
                  )}

                  {!imagePreviewUrl && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1 }}
                    >
                      No image selected
                    </Typography>
                  )}
                </Box>

                {/* Right Side - Preview */}
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        maxHeight: "300px",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        color: "text.disabled",
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="body2">Image Preview</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              size="small"
              onClick={() => {
                setOpenDialog(false);
                resetForm();
              }}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              onClick={handleAddOrUpdateDestination}
              color="primary"
              variant="contained"
              sx={{ textTransform: "none" }}
            >
              {isEditingDestination ? "Update Destination" : "Add Destination"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Destinations Table */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  <Button
                    onClick={sortDestinationsById}
                    endIcon={destinationSortDirection === "asc" ? " ⬆️" : " ⬇️"}
                  >
                    Destination ID
                  </Button>
                </TableCell>
                <TableCell align="center">Destination Name</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {destinationContents
                .slice(
                  destinationPage * rowsPerPage,
                  destinationPage * rowsPerPage + rowsPerPage
                )
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
                    <TableCell align="center">
                      {destination.destination_id}
                    </TableCell>
                    <TableCell align="center">
                      {destination.destination_name}
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditDestination(destination)}
                      >
                        Update
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
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

        {/* Pagination for Destinations */}
        <TablePagination
          rowsPerPageOptions={[8, 10, 25]}
          component="div"
          count={destinationContents.length}
          rowsPerPage={rowsPerPage}
          page={destinationPage}
          onPageChange={handleDestinationPageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>

      <Divider sx={{ my: 4 }} />

      {/* Packages part */}
      <div>
        {/* para part */}
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

        {/* Add/Edit Package Dialog */}
        <Dialog
          open={openPackageDialog}
          onClose={() => {
            setOpenPackageDialog(false);
            resetPackageForm();
            setFormErrors({}); // Clear errors when closing
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
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
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
                  label="Price ($) *"
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
                    validatePackageForm(); // Validate on change
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
                    validatePackageForm(); // Validate on change
                  }}
                  error={!!formErrors.duration}
                  helperText={formErrors.duration || "Minimum 30 minute"}
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
                      {destination.destination_id}.{" "}
                      {destination.destination_name}
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
                      id:{accom.accommodation_id}. {accom.accommodation_name}
                      {" - "}
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

        {/* Package Table */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
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

        {/* Pagination for Packages */}
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
    </div>
  );
};

export default Destinations;
