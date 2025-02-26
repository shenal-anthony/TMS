import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Card } from "@mui/material";

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
        <Typography variant="h5" className="text-center mb-4">
          Register
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <TextField
              label="Username"
              type="text"
              name="name"
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
              label="Password"
              type="password"
              name="password"
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
