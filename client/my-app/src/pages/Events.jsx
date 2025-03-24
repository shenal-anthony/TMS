import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Box,
} from "@mui/material";

const Events = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
      const response = await axios.post(
        `${apiUrl}/api/tourists/accommodations`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setModalMessage(
        response.data.message || "Accommodation registered successfully!"
      );
      setIsSuccess(true);
      setModalOpen(true);
    } catch (error) {
      console.error("Error registering accommodation:", error);
      setModalMessage(
        error.response?.data?.message ||
          "An error occurred during registration."
      );
      setIsSuccess(false);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (isSuccess) {
      navigate("/contents/destinations");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Register New Accommodation
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Accommodation Name"
              name="accommodationName"
              fullWidth
              onChange={handleChange}
              required
            />

            <TextField
              select
              label="Accommodation Type"
              name="accommodationType"
              fullWidth
              onChange={handleChange}
              value={formData.accommodationType}
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
              fullWidth
              onChange={handleChange}
              required
              placeholder="https://maps.google.com/..."
            />

            <TextField
              label="Contact Number"
              name="contactNumber"
              fullWidth
              onChange={handleChange}
              required
            />

            <TextField
              label="Amenities (comma separated)"
              name="amenities"
              fullWidth
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="WiFi, Pool, Parking, etc."
            />

            <TextField
              label="Service URL (Booking link)"
              name="serviceUrl"
              fullWidth
              onChange={handleChange}
              placeholder="https://booking.com/..."
            />

            <Box>
              <Button variant="contained" component="label">
                Upload Accommodation Picture
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
                  <Typography variant="caption">Preview:</Typography>
                  <img
                    src={picturePreview}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "250px",
                      marginTop: "8px",
                      borderRadius: "4px",
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
                />
              }
              label="Terms and Conditions"
            />

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Register Accommodation
            </Button>

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </Box>
        </form>

        {/* Modal Dialog for messages */}
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
