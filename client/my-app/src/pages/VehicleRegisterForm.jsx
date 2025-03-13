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
  Alert,
  Container,
  Box,
} from "@mui/material";

const RegisterVehicleForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    brand: "",
    model: "",
    vehicleColor: "",
    vehicleType: "van",
    fuelType: "petrol",
    airCondition: true,
    registrationNumber: "",
    vehicleNumberPlate: "",
    vehiclePicture: null,
    touristLicense: null,
    agreeTerms: false,
  });
  const [message, setMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the user has agreed to the terms
    if (!formData.agreeTerms) {
      alert("You must agree to the Terms and Conditions to proceed.");
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
        `${apiUrl}/api/vehicles/register`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);
      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Vehicle registration failed"
      );
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
          Register your vehicle
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Owner's Email"
              name="email"
              fullWidth
              onChange={handleChange}
              required
            />

            <TextField
              label="Brand"
              name="brand"
              fullWidth
              onChange={handleChange}
              required
            />

            <TextField
              label="Model"
              name="model"
              fullWidth
              onChange={handleChange}
              required
            />

            <TextField
              label="Vehicle color"
              name="vehicleColor"
              fullWidth
              onChange={handleChange}
              required
            />

            <TextField
              select
              label="Vehicle type"
              name="vehicleType"
              fullWidth
              onChange={handleChange}
              value={formData.vehicleType}
            >
              <MenuItem value="van">Van</MenuItem>
              <MenuItem value="car">Car</MenuItem>
              <MenuItem value="jeep">Jeep</MenuItem>
              <MenuItem value="suv">SUV</MenuItem>
            </TextField>

            <TextField
              select
              label="Fuel type"
              name="fuelType"
              fullWidth
              onChange={handleChange}
              value={formData.fuelType}
            >
              <MenuItem value="petrol">Petrol</MenuItem>
              <MenuItem value="diesel">Diesel</MenuItem>
              <MenuItem value="electric">Electric</MenuItem>
            </TextField>

            <FormControlLabel
              control={
                <Checkbox
                  name="airCondition"
                  checked={formData.airCondition}
                  onChange={handleChange}
                />
              }
              label="Air Condition Available"
            />

            <TextField
              label="Registration number"
              name="registrationNumber"
              fullWidth
              onChange={handleChange}
              required
            />

            <TextField
              label="Vehicle number plate"
              name="vehicleNumberPlate"
              fullWidth
              onChange={handleChange}
              required
            />

            <Button variant="contained" component="label">
              Upload Vehicle Picture
              <input
                type="file"
                name="vehiclePicture"
                onChange={handleFileChange}
                hidden
              />
            </Button>

            <Button variant="contained" component="label">
              Upload Tourist License
              <input
                type="file"
                name="touristLicense"
                onChange={handleFileChange}
                hidden
              />
            </Button>

            <FormControlLabel
              control={
                <Checkbox
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
              }
              label="I agree to the Terms and Conditions, and Privacy Policy"
            />

            <Button type="submit" variant="contained" color="error" fullWidth>
              Register
            </Button>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default RegisterVehicleForm;
