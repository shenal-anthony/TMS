import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  MenuItem,
} from "@mui/material";
import axios from "axios";

const RegisterVehicleForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    brand: "",
    model: "",
    vehicleColor: "",
    vehicleType: "Van",
    fuelType: "Petrol",
    airCondition: true,
    registrationNumber: "",
    vehicleNumberPlate: "",
    vehiclePicture: null,
    touristLicense: null,
    agreeTerms: false,
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    <div className="flex items-center justify-center">
      <form
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <Typography variant="h5" className="text-center mb-4">
          Register your vehicle
        </Typography>

        <TextField
          label="Owner's Email"
          name="email"
          fullWidth
          onChange={handleChange}
          required
        />

        <TextField label="Brand" name="brand" fullWidth onChange={handleChange} required />
        <TextField label="Model" name="model" fullWidth onChange={handleChange} required />
        <TextField label="Vehicle color" name="vehicleColor" fullWidth onChange={handleChange} required />

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

        <FormControlLabel
          control={
            <Checkbox
              name="airCondition"
              checked={formData.airCondition}
              onChange={handleCheckboxChange}
            />
          }
          label="Air Condition Available"
        />

        <TextField label="Registration number" name="registrationNumber" fullWidth onChange={handleChange} required />
        <TextField label="Vehicle number plate" name="vehicleNumberPlate" fullWidth onChange={handleChange} required />

        <div className="mb-4 mt-4">
          <Button variant="contained" component="label">
            Upload Vehicle Picture
            <input type="file" name="vehiclePicture" onChange={handleFileChange} />
          </Button>
        </div>

        <div className="mb-4 mt-4">
          <Button variant="contained" component="label">
            Upload Tourist License
            <input type="file" name="touristLicense" onChange={handleFileChange} />
          </Button>
        </div>

        <FormControlLabel
          control={
            <Checkbox
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleCheckboxChange}
            />
          }
          label="I agree to the Terms and Conditions, and Privacy Policy"
        />

        <Button type="submit" variant="contained" color="error" fullWidth>
          Register
        </Button>

        <div className="mt-4">
          <Button variant="contained" color="primary" fullWidth onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterVehicleForm;
