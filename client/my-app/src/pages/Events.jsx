import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  MenuItem,
  Container,
  Box,
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
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const Events = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Form state
  const [formData, setFormData] = useState({
    accommodationName: "",
    locationUrl: "",
    contactNumber: "",
    amenities: "",
    serviceUrl: "",
    accommodationType: "hotel",
    picture: null,
    agreeTerms: false,
  });

  const [picturePreview, setPicturePreview] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [accommodationContents, setAccommodationContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [e.target.name]: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      accommodationName: "",
      locationUrl: "",
      contactNumber: "",
      amenities: "",
      serviceUrl: "",
      accommodationType: "hotel",
      picture: null,
      agreeTerms: false,
    });
    setPicturePreview("");
    setCurrentId(null);
    setIsEditing(false);
  };

  const fetchAccommodations = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/tourists/accommodations`);
      if (Array.isArray(response.data)) {
        setAccommodationContents(response.data);
      } else {
        setError("Response data is not an array");
      }
    } catch (err) {
      setError("Error fetching accommodations: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreeTerms) {
      setModalMessage(
        "You must agree to the Terms and Conditions before submitting."
      );
      setModalOpen(true);
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const url =
        isEditing && currentId
          ? `${apiUrl}/api/tourists/accommodations/${currentId}`
          : `${apiUrl}/api/tourists/accommodations`;

      const method = isEditing ? "put" : "post";

      const response = await axios[method](url, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setModalMessage(
        response.data.message ||
          `Accommodation ${isEditing ? "updated" : "registered"} successfully!`
      );
      setIsSuccess(true);
      setModalOpen(true);
      fetchAccommodations();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      setModalMessage(
        error.response?.data?.message ||
          "An error occurred during the operation."
      );
      setIsSuccess(false);
      setModalOpen(true);
    }
  };

  const handleRemoveAccommodation = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/tourists/accommodations/${id}`);
      setAccommodationContents(
        accommodationContents.filter((acc) => acc.accommodation_id !== id)
      );
      setModalMessage("Accommodation deleted successfully!");
      setIsSuccess(true);
      setModalOpen(true);
    } catch (error) {
      setModalMessage("Error deleting accommodation: " + error.message);
      setIsSuccess(false);
      setModalOpen(true);
    }
  };

  const handleEditAccommodation = (accommodation) => {
    setFormData({
      accommodationName: accommodation.accommodation_name,
      locationUrl: accommodation.location_url || "",
      contactNumber: accommodation.contact_number || "",
      amenities: accommodation.amenities || "",
      serviceUrl: accommodation.service_url || "",
      accommodationType: accommodation.accommodation_type || "hotel",
      picture: null,
      agreeTerms: false,
    });
    setCurrentId(accommodation.accommodation_id);
    setIsEditing(true);
    setDialogOpen(true);

    if (accommodation.picture_url) {
      setPicturePreview(accommodation.picture_url);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (isSuccess) {
      resetForm();
    }
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
    <Container>
      <Box my={4}>
        <div className="mb-4 mt-4">
          <h1>Accommodation List</h1>
          <div className="mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
            >
              Add New Accommodation
            </Button>
          </div>
        </div>

        {/* Accommodation Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accommodationContents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((accommodation) => (
                  <TableRow key={accommodation.accommodation_id} hover>
                    <TableCell>{accommodation.accommodation_id}</TableCell>
                    <TableCell>{accommodation.accommodation_name}</TableCell>
                    <TableCell>{accommodation.accommodation_type}</TableCell>
                    <TableCell>{accommodation.contact_number}</TableCell>
                    <TableCell style={{ display: "flex" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEditAccommodation(accommodation)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() =>
                          handleRemoveAccommodation(
                            accommodation.accommodation_id
                          )
                        }
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
          count={accommodationContents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        {/* Add/Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            resetForm();
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {isEditing ? "Edit Accommodation" : "Add New Accommodation"}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                label="Accommodation Name"
                name="accommodationName"
                value={formData.accommodationName}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />

              <TextField
                select
                label="Accommodation Type"
                name="accommodationType"
                value={formData.accommodationType}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              >
                <MenuItem value="hotel">Hotel</MenuItem>
                <MenuItem value="apartment">Apartment</MenuItem>
                <MenuItem value="guesthouse">Guesthouse</MenuItem>
                <MenuItem value="resort">Resort</MenuItem>
                <MenuItem value="villa">Villa</MenuItem>
              </TextField>

              <TextField
                label="Location URL (Google Maps)"
                name="locationUrl"
                value={formData.locationUrl}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                placeholder="https://maps.google.com/..."
              />

              <TextField
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />

              <TextField
                label="Amenities (comma separated)"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                placeholder="WiFi, Pool, Parking, etc."
              />

              <TextField
                label="Service URL (Booking link)"
                name="serviceUrl"
                value={formData.serviceUrl}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="https://booking.com/..."
              />

              <Box my={2}>
                <Button variant="contained" component="label">
                  Upload Picture
                  <input
                    type="file"
                    name="picture"
                    onChange={handleFileChange}
                    accept="image/*"
                    hidden
                  />
                </Button>
                {picturePreview && (
                  <Box mt={2}>
                    <Typography variant="subtitle2">Preview:</Typography>
                    <img
                      src={picturePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        marginTop: "8px",
                      }}
                    />
                  </Box>
                )}
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    required
                  />
                }
                label="I agree to the Terms and Conditions"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} color="primary">
              {isEditing ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Message Modal */}
        <Dialog open={modalOpen} onClose={handleCloseModal}>
          <DialogTitle>{isSuccess ? "Success" : "Error"}</DialogTitle>
          <DialogContent>
            <Typography>{modalMessage}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Events;
