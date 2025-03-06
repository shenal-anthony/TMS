import { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    nic: "",
    address1: "",
    address2: "",
    profilePicture: null,
    role: "Guide",
    touristLicense: null,
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreeTerms) {
      alert("You must agree to the Terms and Conditions before signing up.");
      return;
    }

    const formPayload = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        formPayload.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        body: formPayload,
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      const data = await response.json();
      console.log("User registered:", data);

      navigate("/login");
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-center mb-4">
          Create your account
        </h2>

        <TextField
          label="First name"
          name="firstName"
          fullWidth
          className="mb-3"
          onChange={handleChange}
          value={formData.firstName}
        />
        <TextField
          label="Last name"
          name="lastName"
          fullWidth
          className="mb-3"
          onChange={handleChange}
          value={formData.lastName}
        />
        <TextField
          label="Contact number"
          name="contactNumber"
          fullWidth
          className="mb-3"
          onChange={handleChange}
          value={formData.contactNumber}
        />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          fullWidth
          className="mb-3"
          onChange={handleChange}
          value={formData.email}
        />
        <TextField
          label="NIC"
          name="nic"
          fullWidth
          className="mb-3"
          onChange={handleChange}
          value={formData.nic}
        />
        <TextField
          label="Address Line 01"
          name="address1"
          fullWidth
          className="mb-3"
          onChange={handleChange}
          value={formData.address1}
        />
        <TextField
          label="Address Line 02"
          name="address2"
          fullWidth
          className="mb-3"
          onChange={handleChange}
          value={formData.address2}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Profile Picture
        </label>
        <input
          type="file"
          name="profilePicture"
          className="mb-3"
          onChange={handleChange}
        />

        <TextField
          select
          label="Select the role"
          name="role"
          fullWidth
          className="mb-3"
          onChange={handleChange}
          value={formData.role}
        >
          <MenuItem value="Guide">Guide</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
        </TextField>

        {formData.role === "Guide" && (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tourist License
            </label>
            <input
              type="file"
              name="touristLicense"
              className="mb-3"
              onChange={handleChange}
              multiple
            />
          </>
        )}

        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          className="mb-3"
          onChange={handleChange}
          value={formData.password}
        />
        <TextField
          label="Re-enter Password"
          name="confirmPassword"
          type="password"
          fullWidth
          className="mb-3"
          onChange={handleChange}
          value={formData.confirmPassword}
        />

        <FormControlLabel
          control={
            <Checkbox
              name="agreeTerms"
              onChange={handleChange}
              checked={formData.agreeTerms}
            />
          }
          label="I agree to the Terms and Conditions, and Privacy Policy"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          className="mt-4"
        >
          Sign Up
        </Button>

        <p className="text-center mt-3 text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500">
            Sign In
          </a>
        </p>
      </form>
    </div>
  );
}
