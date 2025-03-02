import { useState } from "react";
import { registerUser } from "../state/authService";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Card,
  MenuItem,
} from "@mui/material";

const RegisterVehicleForm = () => {
  const [formData, setFormData] = useState({
    ownerName: "",
    brand: "",
    model: "",
    vehicleColor: "",
    vehicleType: "Van",
    fuelType: "Petrol",
    airCondition: "Yes",
    registrationNumber: "",
    vehicleNumberPlate: "",
    vehiclePicture: null,
    touristLicense: null,
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser(formData);
      setMessage(response.message);
      navigate("/dashboard"); // Redirect to dashboard after successful registration
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <Typography variant="h4" className="mb-4 font-bold">
          Welcome to Ceylonian!
        </Typography>
        <Typography variant="body1" className="text-center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vulpatae ut
          laoreet velit ma.
        </Typography>
      </div>
      <Container className="w-1/2 flex items-center justify-center">
        <Card className="p-8 shadow-xl w-full max-w-md">
          <Typography variant="h5" className="text-center mb-4">
            Register your vehicle
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Owner name"
              name="ownerName"
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
              <MenuItem value="Van">Van</MenuItem>
              <MenuItem value="Car">Car</MenuItem>
              <MenuItem value="Bike">Bike</MenuItem>
            </TextField>
            <TextField
              select
              label="Fuel type"
              name="fuelType"
              fullWidth
              onChange={handleChange}
              value={formData.fuelType}
            >
              <MenuItem value="Petrol">Petrol</MenuItem>
              <MenuItem value="Diesel">Diesel</MenuItem>
              <MenuItem value="Electric">Electric</MenuItem>
            </TextField>
            <TextField
              select
              label="Air condition"
              name="airCondition"
              fullWidth
              onChange={handleChange}
              value={formData.airCondition}
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
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
            <Button variant="contained" component="label" fullWidth>
              Upload Vehicle Picture
              <input
                type="file"
                name="vehiclePicture"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            <Button variant="contained" component="label" fullWidth>
              Upload Tourist License
              <input
                type="file"
                name="touristLicense"
                hidden
                onChange={handleFileChange}
              />
            </Button>
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
          </form>
        </Card>
      </Container>
    </div>
  );
};

export default RegisterVehicleForm;
