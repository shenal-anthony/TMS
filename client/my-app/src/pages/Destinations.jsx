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
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const Destinations = () => {
  const [destinationSortDirection, setDestinationSortDirection] =
    useState("asc");
  const [destinations, setDestinations] = useState([]);
  const [destinationContents, setDestinationContents] = useState([]);
  const [destinationLoading, setDestinationLoading] = useState(true);
  const [destinationError, setDestinationError] = useState(null);
  const [destinationPage, setDestinationPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditingDestination, setIsEditing] = useState(false);
  const [currentDestination, setCurrentDestination] = useState({
    destinationName: "",
    description: "",
    weatherCondition: "",
    locationUrl: "",
    pictureUrl: "",
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
        setCurrentDestination({
          ...currentDestination,
          pictureFile: file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchDestinations = () => {
    axios
      .get(`${apiUrl}/api/contents/destinations`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setDestinationContents(response.data);
          setDestinations(response.data);
        } else {
          setDestinationError("Response data is not an array");
        }
        setDestinationLoading(false);
      })
      .catch((destinationError) => {
        setDestinationError(
          "Error fetching destinations: " + destinationError.message
        );
        setDestinationLoading(false);
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

  const handleAddOrUpdateDestination = () => {
    const formData = new FormData();
    formData.append("destinationName", currentDestination.destinationName);
    formData.append("description", currentDestination.description);
    formData.append("weatherCondition", currentDestination.weatherCondition);
    formData.append("locationUrl", currentDestination.locationUrl);

    if (currentDestination.pictureFile) {
      formData.append("destination", currentDestination.pictureFile);
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
      .then(() => {
        fetchDestinations();
        setOpenDialog(false);
        resetForm();
      })
      .catch((destinationError) => {
        setDestinationError(
          "Error saving destination: " + destinationError.message
        );
      });
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
    setImagePreviewUrl(destination.picture_url || null);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setCurrentDestination({
      destinationName: "",
      description: "",
      weatherCondition: "",
      locationUrl: "",
      pictureUrl: "",
    });
    setImagePreviewUrl(null);
    setIsEditing(false);
  };

  const handleDestinationPageChange = (event, newPage) => {
    setDestinationPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setDestinationPage(0);
  };

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

  const sortDestinationsByName = () => {
    const sorted = [...destinationContents].sort((a, b) => {
      return destinationSortDirection === "asc"
        ? a.destination_name.localeCompare(b.destination_name)
        : b.destination_name.localeCompare(a.destination_name);
    });
    setDestinationContents(sorted);
    setDestinationSortDirection(
      destinationSortDirection === "asc" ? "desc" : "asc"
    );
  };

  if (destinationLoading) return <div>Loading...</div>;
  if (destinationError) return <div>{destinationError}</div>;

  return (
    <div>
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
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

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell align="center">
                <Button
                  onClick={sortDestinationsById}
                  endIcon={destinationSortDirection === "asc" ? " ⬆️" : " ⬇️"}
                >
                  Destination ID
                </Button>
              </TableCell>
              <TableCell align="center">
                <Button
                  onClick={sortDestinationsByName}
                  endIcon={destinationSortDirection === "asc" ? " ⬆️" : " ⬇️"}
                >
                  Destination Name
                </Button>
              </TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {destinationContents
              .slice(
                destinationPage * rowsPerPage,
                destinationPage * rowsPerPage + rowsPerPage
              )
              .map((destination, index) => (
                <TableRow
                  key={destination.destination_id}
                  sx={{
                    "&:hover td": {
                      backgroundColor: "#e3f2fd !important",
                    },
                  }}
                >
                  <TableCell align="center">
                    {index + 1 + destinationPage * rowsPerPage}
                  </TableCell>
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
  );
};

export default Destinations;
