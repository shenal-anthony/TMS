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
  MenuItem,
  Chip,
  Select,
  OutlinedInput,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckIcon from "@mui/icons-material/Check";

const Tours = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [tourFormData, setTourFormData] = useState({
    activity: "",
    destination_ids: [],
    accommodation_ids: [],
    picture: null,
  });
  const [formErrors, setFormErrors] = useState({
    activity: "",
    destinationIds: "",
    accommodationIds: "",
    picture: "",
  });
  const [tourPicturePreview, setTourPicturePreview] = useState("");
  const [destinationContents, setDestinationContents] = useState([]);
  const [accommodationContents, setAccommodationContents] = useState([]);
  const [tourContents, setTourContents] = useState([]);
  const [tourDialogOpen, setTourDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [tourLoading, setTourLoading] = useState(true);
  const [tourError, setTourError] = useState(null);
  const [tourPage, setTourPage] = useState(0);
  const [tourRowsPerPage, setTourRowsPerPage] = useState(8);

  // MenuProps to style the dropdown menu
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 224,
        width: 250,
      },
    },
  };

  // Styling function for MenuItem based on selection
  const getStyles = (id, selectedIds, theme) => ({
    fontWeight: selectedIds.includes(id)
      ? theme.typography.fontWeightBold
      : theme.typography.fontWeightRegular,
  });

  const handleTourChange = (e) => {
    const { name, value } = e.target;
    setTourFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user changes the field
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTourFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTourFormData((prev) => ({ ...prev, picture: file }));
      setFormErrors((prev) => ({ ...prev, picture: "" }));
      const reader = new FileReader();
      reader.onloadend = () => setTourPicturePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetTourForm = () => {
    setTourFormData({
      activity: "",
      destination_ids: [],
      accommodation_ids: [],
      picture: null,
    });
    setFormErrors({
      activity: "",
      destinationIds: "",
      accommodationIds: "",
      picture: "",
    });
    setTourPicturePreview("");
    setCurrentId(null);
    setIsEditing(false);
  };

  const fetchDestinations = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/contents/destinations`);
      if (Array.isArray(response.data)) {
        setDestinationContents(response.data);
      } else {
        setTourError("Destination response data is not an array");
      }
    } catch (err) {
      setTourError("Error fetching destinations: " + err.message);
    }
  };

  const fetchAccommodations = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/contents/accommodations`);
      if (Array.isArray(response.data)) {
        setAccommodationContents(response.data);
      } else {
        setTourError("Response data is not an array");
      }
    } catch (err) {
      setTourError("Error fetching accommodations: " + err.message);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/contents/tours`);
      if (Array.isArray(response.data)) {
        setTourContents(response.data);
      } else {
        setTourError("Response data is not an array");
      }
    } catch (err) {
      setTourError("Error fetching tours: " + err.message);
    } finally {
      setTourLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!tourFormData.activity) {
      errors.activity = "Activity is required";
    }
    if (tourFormData.destination_ids.length === 0) {
      errors.destinationIds = "At least one destination is required";
    }
    if (tourFormData.accommodation_ids.length === 0) {
      errors.accommodationIds = "At least one accommodation is required";
    }
    if (!tourFormData.picture && !tourPicturePreview) {
      errors.picture = "An image is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddOrUpdateTour = async () => {
    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("activity", tourFormData.activity);
    tourFormData.destination_ids.forEach((id) =>
      formDataToSend.append("destination_ids[]", id)
    );
    tourFormData.accommodation_ids.forEach((id) =>
      formDataToSend.append("accommodation_ids[]", id)
    );
    if (tourFormData.picture) {
      formDataToSend.append("tour", tourFormData.picture);
    } else if (tourPicturePreview && isEditing) {
      formDataToSend.append("picture_url", tourPicturePreview);
    }

    try {
      const response =
        isEditing && currentId
          ? await axios.patch(
              `${apiUrl}/api/contents/tours/${currentId}`,
              formDataToSend,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            )
          : await axios.post(`${apiUrl}/api/contents/tours`, formDataToSend, {
              headers: { "Content-Type": "multipart/form-data" },
            });

      setModalMessage(
        response.data.message ||
          `Tour ${isEditing ? "updated" : "added"} successfully!`
      );
      setIsSuccess(true);
      fetchTours();
      setTourDialogOpen(false);
      resetTourForm();
    } catch (err) {
      setModalMessage("Error saving tour: " + err.message);
      setIsSuccess(false);
    } finally {
      setModalOpen(true);
    }
  };

  const handleRemoveTour = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/contents/tours/${id}`);
      setTourContents(tourContents.filter((tour) => tour.tour_id !== id));
      setModalMessage("Tour deleted successfully!");
      setIsSuccess(true);
    } catch (err) {
      setModalMessage("Error deleting tour: " + err.message);
      setIsSuccess(false);
    } finally {
      setModalOpen(true);
    }
  };

  const handleEditTour = (tour) => {
    setTourFormData({
      activity: tour.activity,
      destination_ids: tour.destinations?.map((dest) => dest.destination_id) || [],
      accommodation_ids: tour.accommodations?.map((acc) => acc.accommodation_id) || [],
      picture: null,
    });
    setFormErrors({
      activity: "",
      destinationIds: "",
      accommodationIds: "",
      picture: "",
    });
    setTourPicturePreview(tour.picture_url || "");
    setCurrentId(tour.tour_id);
    setIsEditing(true);
    setTourDialogOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (isSuccess) {
      resetTourForm();
    }
  };

  useEffect(() => {
    fetchTours();
    fetchDestinations();
    fetchAccommodations();
  }, []);

  if (tourLoading) return <div>Loading...</div>;
  if (tourError) return <div>{tourError}</div>;

  return (
    <div>
      <div className="mb-4 mt-4">
        <Typography variant="h5">Tours</Typography>
        <div className="mt-4">
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              resetTourForm();
              setTourDialogOpen(true);
            }}
          >
            Add Tour
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">Activity</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tourContents.length > 0 ? (
              tourContents
                .slice(
                  tourPage * tourRowsPerPage,
                  tourPage * tourRowsPerPage + tourRowsPerPage
                )
                .map((tour, index) => (
                  <TableRow
                    key={tour.tour_id}
                    sx={{
                      "&:hover td": {
                        backgroundColor: "#e3f2fd",
                      },
                    }}
                  >
                    <TableCell align="center">
                      {tourPage * tourRowsPerPage + index + 1}
                    </TableCell>
                    <TableCell align="center">{tour.tour_id}</TableCell>
                    <TableCell align="center">{tour.activity}</TableCell>
                    <TableCell
                      align="center"
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEditTour(tour)}
                        sx={{ mr: 1 }}
                      >
                        Update
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleRemoveTour(tour.tour_id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No Tours found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[8, 10, 25]}
        component="div"
        count={tourContents.length}
        rowsPerPage={tourRowsPerPage}
        page={tourPage}
        onPageChange={(event, newPage) => setTourPage(newPage)}
        onRowsPerPageChange={(event) => {
          setTourRowsPerPage(parseInt(event.target.value, 10));
          setTourPage(0);
        }}
      />

      <Dialog
        open={tourDialogOpen}
        onClose={() => setTourDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{isEditing ? "Edit Tour" : "Add Tour"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
            <FormControl margin="dense" error={!!formErrors.activity}>
              <InputLabel id="activity-label">Activity *</InputLabel>
              <OutlinedInput
                size="small"
                label="Activity *"
                name="activity"
                value={tourFormData.activity}
                onChange={handleTourChange}
                fullWidth
              />
              {formErrors.activity && (
                <FormHelperText>{formErrors.activity}</FormHelperText>
              )}
            </FormControl>
            <FormControl
              sx={{ m: 1, width: 300 }}
              margin="dense"
              error={!!formErrors.destinationIds}
            >
              <InputLabel id="destinations-chip-label">Destinations *</InputLabel>
              <Select
                labelId="destinations-chip-label"
                id="destinations-chip"
                multiple
                value={tourFormData.destination_ids}
                onChange={handleTourChange}
                name="destination_ids"
                input={<OutlinedInput id="select-destinations-chip" label="Destinations *" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((id) => {
                      const dest = destinationContents.find(
                        (d) => d.destination_id === id
                      );
                      return dest ? (
                        <Chip key={id} label={dest.destination_name} size="small" />
                      ) : null;
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {destinationContents.map((dest) => (
                  <MenuItem
                    key={dest.destination_id}
                    value={dest.destination_id}
                    style={getStyles(
                      dest.destination_id,
                      tourFormData.destination_ids,
                      { typography: { fontWeightRegular: 400, fontWeightBold: 700 } }
                    )}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    {tourFormData.destination_ids.includes(dest.destination_id) && (
                      <CheckIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    )}
                    <Typography fontWeight="500">{dest.destination_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      (ID: {dest.destination_id})
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
              <InputLabel id="accommodations-chip-label">Accommodations *</InputLabel>
              <Select
                labelId="accommodations-chip-label"
                id="accommodations-chip"
                multiple
                value={tourFormData.accommodation_ids}
                onChange={handleTourChange}
                name="accommodation_ids"
                input={<OutlinedInput id="select-accommodations-chip" label="Accommodations *" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((id) => {
                      const acc = accommodationContents.find(
                        (a) => a.accommodation_id === id
                      );
                      return acc ? (
                        <Chip key={id} label={acc.accommodation_name} size="small" />
                      ) : null;
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {accommodationContents.map((acc) => (
                  <MenuItem
                    key={acc.accommodation_id}
                    value={acc.accommodation_id}
                    style={getStyles(
                      acc.accommodation_id,
                      tourFormData.accommodation_ids,
                      { typography: { fontWeightRegular: 400, fontWeightBold: 700 } }
                    )}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    {tourFormData.accommodation_ids.includes(acc.accommodation_id) && (
                      <CheckIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    )}
                    <Typography fontWeight="500">{acc.accommodation_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      (ID: {acc.accommodation_id})
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
              {formErrors.accommodationIds && (
                <FormHelperText>{formErrors.accommodationIds}</FormHelperText>
              )}
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tour Image *
              </Typography>
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<CloudUploadIcon />}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleTourFileChange}
                />
              </Button>
              {formErrors.picture && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                  {formErrors.picture}
                </Typography>
              )}
              {tourPicturePreview && (
                <Box
                  sx={{
                    mt: 2,
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                    bgcolor: "background.paper",
                  }}
                >
                  <img
                    src={tourPicturePreview}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Button
            onClick={() => setTourDialogOpen(false)}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            size="small"
            onClick={handleAddOrUpdateTour}
            sx={{ textTransform: "none" }}
            disabled={
              !tourFormData.activity ||
              tourFormData.destination_ids.length === 0 ||
              tourFormData.accommodation_ids.length === 0 ||
              (!tourFormData.picture && !tourPicturePreview)
            }
          >
            {isEditing ? "Save Changes" : "Add Tour"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xs">
        <DialogTitle sx={{ p: 2, pb: 1 }}>
          {isSuccess ? "✅ Success" : "❌ Error"}
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 1 }}>
          <Button
            onClick={handleCloseModal}
            size="small"
            sx={{ textTransform: "none" }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Tours;