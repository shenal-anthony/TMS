import { useState } from "react";
import { TextField, Button, Container, Typography, Card } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("http://localhost:8000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            navigate("/dashboard"); // Redirect to dashboard
        } else {
            alert("Invalid login. Please try again.");
        }
    };

    return (
        <Container className="flex items-center justify-center min-h-screen">
            <Card className="p-8 shadow-xl w-full max-w-sm">
                <div><Typography variant="h5" className="text-center mb-4">
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
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Login
                    </Button>
                </form>
                <div>
                <Typography variant="body2" className="text-center mt-4">
                    Don't have an account? <Link to="/register" className="text-blue-600">Sign up</Link>
                </Typography>
                </div>
            </Card>
        </Container>
    );
};

export default LoginForm;
