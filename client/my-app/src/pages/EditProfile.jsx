import { useState, useEffect } from "react";
import { TextField, Button, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";

const EditProfile = ({ userId }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    address1: "",
    address2: "",
    nic: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState("");
  const [touristLicenseFiles, setTouristLicenseFiles] = useState([]);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard"); // Update with your actual dashboard route
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/auth/user/${userId}`
        );
        const data = await response.json();
        if (response.ok) {
          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: data.email || "",
            contactNumber: data.contact_number || "",
            address1: data.address1 || "",
            address2: data.address2 || "",
            nic: data.nic || "",
            password: data.password || "",
            confirmPassword: data.password || "",
          });
          setProfilePicture(`http://localhost:5000${data.profile_picture}`);
          setTouristLicenseFiles(data.tourist_license || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleTouristLicenseChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      alert("You can upload up to 4 images only");
      return;
    }
    setTouristLicenseFiles(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("firstName", formData.firstName);
    form.append("lastName", formData.lastName);
    form.append("email", formData.email);
    form.append("contactNumber", formData.contactNumber);
    form.append("address1", formData.address1);
    form.append("address2", formData.address2);
    form.append("nic", formData.nic);
    form.append("password", formData.password);
    if (selectedFile) {
      form.append("profilePicture", selectedFile);
    }
    touristLicenseFiles.forEach((file, index) => {
      form.append("touristLicense", file, `touristLicense${index}`);
    });
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/edit-profile/${userId}`,
        {
          method: "PUT",
          body: form,
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-6">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleBack}
          className="mb-4"
        >
          ← Back
        </Button>

        <h2 className="text-2xl font-semibold text-center mb-4">
          Edit Profile
        </h2>
        <div className="flex flex-col items-center m-4">
          <Avatar
            src={profilePicture}
            alt="Profile Picture"
            sx={{ width: 120, height: 120, borderRadius: "50%" }}
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-2"
            accept="image/*"
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Contact Number"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Address Line 1"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Address Line 2"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="NIC"
            name="nic"
            value={formData.nic}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <div className="justify-items-center mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Upload Tourist License (Max 4)
            </label>
            <input
              type="file"
              multiple
              onChange={handleTouristLicenseChange}
              className="mt-2"
              accept="image/*"
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              {touristLicenseFiles.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Tourist License ${index}`}
                  className="w-32 h-32 object-cover rounded-sm border border-gray-300"
                />
              ))}
            </div>
          </div>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
