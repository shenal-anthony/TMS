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
  OutlinedInput,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(value, selectedValues, theme) {
  return {
    fontWeight: selectedValues.includes(value)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
    backgroundColor: selectedValues.includes(value)
      ? theme.palette.action.selected
      : "inherit",
  };
}

const Packages = () => {
  const theme = useTheme();
  const [packageSortDirection, setPackageSortDirection] = useState("asc");
  const [nameSortDirection, setNameSortDirection] = useState("asc");
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
    accommodationIds: [],
    destinationIds: [],
    packageId: null,
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
      .catch((error) => {
        setPackageError("Error fetching accommodations: " + error.message);
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
          const normalizedPackages = response.data.map((item) => ({
            package_id: item.package.packageId,
            package_name: item.package.packageName,
            description: item.package.description,
            price: parseFloat(item.package.price),
            duration: item.package.duration,
            accommodation_ids: item.package.accommodationId
              ? [item.package.accommodationId]
              : [],
            destination_ids: item.package.destinationId
              ? [item.package.destinationId]
              : [],
            accommodation: item.accommodation || {},
            destination: item.destination || {},
          }));
          setPackageContents(normalizedPackages);
        } else {
          setPackageError("Response data is not an array");
        }
        setPackageLoading(false);
      })
      .catch((error) => {
        setPackageError("Error fetching packages: " + error.message);
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
      .catch((error) => {
        setPackageError("Error deleting package: " + error.message);
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
      destination_ids: currentPackage.destinationIds,
      accommodation_ids: currentPackage.accommodationIds,
    };

    if (isEditingPackage) {
      axios
        .patch(
          `${apiUrl}/api/contents/packages/${currentPackage.packageId}`,
          packageData
        )
        .then((response) => {
          setPackageContents(
            packageContents.map((pkg) =>
              pkg.package_id === currentPackage.packageId
                ? {
                    ...pkg,
                    package_name: response.data.package_name,
                    description: response.data.description,
                    price: response.data.price,
                    duration: response.data.duration,
                    accommodation_ids: response.data.accommodation_ids,
                    destination_ids: response.data.destination_ids,
                  }
                : pkg
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
          setPackageContents([
            ...packageContents,
            {
              package_id: response.data.package_id,
              package_name: response.data.package_name,
              description: response.data.description,
              price: response.data.price,
              duration: response.data.duration,
              accommodation_ids: response.data.accommodation_ids,
              destination_ids: response.data.destination_ids,
              accommodation: {},
              destination: {},
            },
          ]);
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
      packageId: pkg.package_id,
      packageName: pkg.package_name,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
      accommodationIds: pkg.accommodation_ids,
      destinationIds: pkg.destination_ids,
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
    } else if (currentPackage.duration <= 30) {
      errors.duration = "Duration must be at least 30 minutes";
    }

    if (
      !currentPackage.destinationIds ||
      currentPackage.destinationIds.length === 0
    ) {
      errors.destinationIds = "Please select at least one destination";
    }

    if (
      !currentPackage.accommodationIds ||
      currentPackage.accommodationIds.length === 0
    ) {
      errors.accommodationIds = "Please select at least one accommodation";
    }

    return errors;
  };

  const resetPackageForm = () => {
    setCurrentPackage({
      packageName: "",
      description: "",
      price: "",
      duration: "",
      accommodationIds: [],
      destinationIds: [],
      packageId: null,
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

  const sortPackagesByName = () => {
    const sorted = [...packageContents].sort((a, b) => {
      if (nameSortDirection === "asc") {
        return a.package_name.localeCompare(b.package_name);
      } else {
        return b.package_name.localeCompare(a.package_name);
      }
    });
    setPackageContents(sorted);
    setNameSortDirection(nameSortDirection === "asc" ? "desc" : "asc");
  };

  const getDestinationNames = (destinationIds, destinations) => {
    if (!destinationIds || destinationIds.length === 0) return "N/A";
    return destinationIds
      .map((id) => {
        const dest = destinations.find((d) => d.destination_id === id);
        return dest ? dest.destination_name : "Unknown";
      })
      .join(", ");
  };

  const getAccommodationNames = (accommodationIds, accommodations) => {
    if (!accommodationIds || accommodationIds.length === 0) return "N/A";
    return accommodationIds
      .map((id) => {
        const acc = accommodations.find((a) => a.accommodation_id === id);
        return acc ? acc.accommodation_name : "Unknown";
      })
      .join(", ");
  };

  const handleDestinationChange = (event) => {
    const {
      target: { value },
    } = event;
    setCurrentPackage({
      ...currentPackage,
      destinationIds: typeof value === "string" ? value.split(",") : value,
    });
    validatePackageForm();
  };

  const handleAccommodationChange = (event) => {
    const {
      target: { value },
    } = event;
    setCurrentPackage({
      ...currentPackage,
      accommodationIds: typeof value === "string" ? value.split(",") : value,
    });
    validatePackageForm();
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
              sx={{ m: 1, width: 300 }}
              margin="dense"
              error={!!formErrors.destinationIds}
            >
              <InputLabel id="destinations-chip-label">
                Destinations *
              </InputLabel>
              <Select
                labelId="destinations-chip-label"
                id="destinations-chip"
                multiple
                value={currentPackage.destinationIds}
                onChange={handleDestinationChange}
                input={
                  <OutlinedInput
                    id="select-destinations-chip"
                    label="Destinations *"
                  />
                }
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const dest = destinations.find(
                        (d) => d.destination_id === value
                      );
                      return (
                        <Chip
                          key={value}
                          label={dest ? dest.destination_name : value}
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {destinations.map((destination) => (
                  <MenuItem
                    key={destination.destination_id}
                    value={destination.destination_id}
                    style={getStyles(
                      destination.destination_id,
                      currentPackage.destinationIds,
                      theme
                    )}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    {currentPackage.destinationIds.includes(
                      destination.destination_id
                    ) && (
                      <CheckIcon
                        fontSize="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                    )}
                    <Typography fontWeight="500">
                      {destination.destination_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      (ID: {destination.destination_id})
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
              {formErrors.destinationIds && (
                <FormHelperText>{formErrors.destinationIds}</FormHelperText>
              )}
            </FormControl>
            <FormControl
              sx={{ m: 1, width: 300 }}
              margin="dense"
              error={!!formErrors.accommodationIds}
            >
              <InputLabel id="accommodations-chip-label">
                Accommodations *
              </InputLabel>
              <Select
                labelId="accommodations-chip-label"
                id="accommodations-chip"
                multiple
                value={currentPackage.accommodationIds}
                onChange={handleAccommodationChange}
                input={
                  <OutlinedInput
                    id="select-accommodations-chip"
                    label="Accommodations *"
                  />
                }
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const accom = accommodations.find(
                        (a) => a.accommodation_id === value
                      );
                      return (
                        <Chip
                          key={value}
                          label={accom ? accom.accommodation_name : value}
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {accommodations.map((accom) => (
                  <MenuItem
                    key={accom.accommodation_id}
                    value={accom.accommodation_id}
                    style={getStyles(
                      accom.accommodation_id,
                      currentPackage.accommodationIds,
                      theme
                    )}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    {currentPackage.accommodationIds.includes(
                      accom.accommodation_id
                    ) && (
                      <CheckIcon
                        fontSize="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                    )}
                    <Typography fontWeight="500">
                      {accom.accommodation_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      (ID: {accom.accommodation_id} — Type:{" "}
                      {accom.accommodation_type})
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
              {formErrors.accommodationIds && (
                <FormHelperText>{formErrors.accommodationIds}</FormHelperText>
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
              currentPackage.destinationIds.length === 0 ||
              currentPackage.accommodationIds.length === 0
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
              <TableCell align="center">
                <Button
                  onClick={sortPackagesByName}
                  endIcon={nameSortDirection === "asc" ? " ⬆️" : " ⬇️"}
                >
                  Package Name
                </Button>
              </TableCell>
              <TableCell align="center">Duration</TableCell>
              <TableCell align="center">Destinations</TableCell>
              <TableCell align="center">Accommodations</TableCell>
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
                    <TableCell align="center">
                      {getDestinationNames(pkg.destination_ids, destinations)}
                    </TableCell>
                    <TableCell align="center">
                      {getAccommodationNames(
                        pkg.accommodation_ids,
                        accommodations
                      )}
                    </TableCell>
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
                <TableCell colSpan={7} align="center">
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
