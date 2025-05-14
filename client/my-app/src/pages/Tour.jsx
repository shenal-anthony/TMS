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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const Tours = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [tourFormData, setTourFormData] = useState({
    activity: "",
    destination_id: "",
    accommodation_id: "",
    picture: null,
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

  const handleTourChange = (e) => {
    const { name, value } = e.target;
    setTourFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTourFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTourFormData((prev) => ({ ...prev, picture: file }));
      const reader = new FileReader();
      reader.onloadend = () => setTourPicturePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetTourForm = () => {
    setTourFormData({
      activity: "",
      destination_id: "",
      accommodation_id: "",
      picture: null,
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

  const handleAddOrUpdateTour = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append("activity", tourFormData.activity);
    formDataToSend.append("destination_id", tourFormData.destination_id);
    formDataToSend.append("accommodation_id", tourFormData.accommodation_id);
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
      destination_id: tour.destination_id || "",
      accommodation_id: tour.accommodation_id || "",
      picture: null,
    });
    setTourPicturePreview(tour.picture_url);
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
            <TextField
              size="small"
              label="Activity *"
              name="activity"
              value={tourFormData.activity}
              onChange={handleTourChange}
              fullWidth
            />
            <TextField
              size="small"
              select
              label="Destination *"
              name="destination_id"
              value={tourFormData.destination_id}
              onChange={handleTourChange}
              fullWidth
            >
              {destinationContents.map((dest) => (
                <MenuItem key={dest.destination_id} value={dest.destination_id}>
                  {dest.destination_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              select
              label="Accommodation *"
              name="accommodation_id"
              value={tourFormData.accommodation_id}
              onChange={handleTourChange}
              fullWidth
            >
              {accommodationContents.map((acc) => (
                <MenuItem key={acc.accommodation_id} value={acc.accommodation_id}>
                  {acc.accommodation_name}
                </MenuItem>
              ))}
            </TextField>
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
              !tourFormData.destination_id ||
              !tourFormData.accommodation_id ||
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