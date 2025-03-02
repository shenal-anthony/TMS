import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Card,
  Checkbox,
} from "@mui/material";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser(formData);
      setMessage(response.message);
      navigate("/login"); // Redirect to login after successful registration
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Container className="flex items-center justify-center min-h-screen">
      <Card className="p-8 shadow-xl w-full max-w-sm">
        <div className="mb-2">
          <Typography variant="h5" className="text-center mb-4">
            Register
          </Typography>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <TextField
              label="First name"
              type="text"
              name="firstName"
              fullWidth
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <TextField
              label="Last name"
              type="text"
              name="lastName"
              fullWidth
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <TextField
              label="Contact number"
              type="tel"
              name="contactNo"
              fullWidth
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <TextField
              label="Email"
              type="email"
              name="email"
              fullWidth
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <TextField
              label="NIC"
              type="text"
              name="nic"
              fullWidth
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <select label="Admin" type="role" name="role" />
          </div>
          <div>
            <TextField
              label="Address line 01"
              type="text"
              name="addressLine1"
              fullWidth
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <TextField
              label="Address line 02"
              type="text"
              name="addressLine2"
              fullWidth
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <TextField
              label="Password"
              type="password"
              name="password"
              fullWidth
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <TextField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              fullWidth
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Register
          </Button>
        </form>
        {message && (
          <Typography variant="body2" className="text-center mt-4 text-red-600">
            {message}
          </Typography>
        )}
      </Card>
    </Container>
  );
};

export default RegisterForm;
