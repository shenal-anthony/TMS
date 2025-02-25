import { useState } from "react";
import { loginUser } from "../services/authService";
import { TextField, Button, Card, CardContent, Typography, Alert } from "@mui/material";

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      setMessage(response.message);
      setError(false);
      localStorage.setItem("token", response.token);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
      setError(true);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <CardContent>
          <Typography variant="h5" className="text-center mb-4 font-semibold">
            Login
          </Typography>
          {message && (
            <Alert severity={error ? "error" : "success"} className="mb-4">
              {message}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              name="email"
              type="email"
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              name="password"
              type="password"
              onChange={handleChange}
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth className="py-2">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
