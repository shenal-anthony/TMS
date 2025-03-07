import { useState } from "react";
import { TextField, Button, Container, Typography, Card } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password,
      });

      // If login is successful, store the token and navigate
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert(
        error.response?.data?.message || "Invalid login. Please try again."
      );
    }
  };

  return (
    <Container className="flex items-center justify-center min-h-screen">
      <Card className="p-8 shadow-xl w-full max-w-sm">
        <div>
          <Typography variant="h5" className="text-center mb-4">
            Login
          </Typography>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Typography variant="body2" className="text-right text-blue-600 ">
              <Link to="/forgot-password">Forgot password?</Link>
            </Typography>
          </div>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
        <div className="mt-4">
          <Typography variant="body2" className="text-center mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600">
              Sign up
            </Link>
          </Typography>
        </div>
      </Card>
    </Container>
  );
};

export default LoginForm;
