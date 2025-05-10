import React, { useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    nic: "",
    address1: "",
    password: "",
    confirmPassword: "",
    role: "admin", // default
  });

  const [profileImage, setProfileImage] = useState(null);
  const [licenses, setLicenses] = useState([]); // multiple files

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (formData.role === "guide" && licenses.length > 3) {
      alert("You can upload up to 3 license files only.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (profileImage) data.append("profilePicture", profileImage);
    if (formData.role === "guide") {
      licenses.forEach((file) => data.append("touristLicense", file)); // plural field name
    }

    try {
      const res = await axios.post(`${apiUrl}/api/auth/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Registration successful!");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Registration failed.");
    }
  };

  return (
    <div>
      <h2>User Registration</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="firstName"
          placeholder="First Name"
          onChange={handleChange}
          required
        />
        <input
          name="lastName"
          placeholder="Last Name"
          onChange={handleChange}
          required
        />
        <input
          name="contactNumber"
          placeholder="Contact Number"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input name="nic" placeholder="NIC" onChange={handleChange} required />
        <input
          name="address1"
          placeholder="Address"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          onChange={handleChange}
          required
        />

        <div>
          <label>User Role:</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="guide">Guide</option>
          </select>
        </div>

        <div>
          <label>Profile Picture:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files[0])}
          />
        </div>

        {formData.role === "guide" && (
          <div>
            <label>License Documents (max 3):</label>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={(e) => setLicenses(Array.from(e.target.files))}
            />
          </div>
        )}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationForm;
