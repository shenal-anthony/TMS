import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Avatar,
  Box,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
  const [existingLicenses, setExistingLicenses] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const openFile = (src) => {
    window.open(src, "_blank");
  };

  const handleBack = () => navigate(-1);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get(`/api/auth/user/${userId}`);
      const { data } = response;

      setFormData({
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        email: data.email_address || "",
        contactNumber: data.contact_number || "",
        address1: data.addressline_01 || "",
        address2: data.addressline_02 || "",
        nic: data.nic_number || "",
        password: "",
        confirmPassword: "",
      });

      if (data.profile_picture) {
        setProfilePicture(
          `${axiosInstance.defaults.baseURL}${data.profile_picture}`
        );
      }

      if (data.tourist_license) {
        const licenses = data.tourist_license.split(",").filter(Boolean);
        setExistingLicenses(
          licenses.map(
            (license) => `${axiosInstance.defaults.baseURL}${license}`
          )
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
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
    if (files.length + touristLicenseFiles.length > 4) {
      alert("You can upload up to 4 images only");
      return;
    }
    setTouristLicenseFiles([
      ...touristLicenseFiles,
      ...files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeLicense = (index, isExisting) => {
    isExisting
      ? setExistingLicenses(existingLicenses.filter((_, i) => i !== index))
      : setTouristLicenseFiles(
          touristLicenseFiles.filter((_, i) => i !== index)
        );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: "Passwords do not match" });
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value && key !== "confirmPassword") form.append(key, value);
    });

    if (selectedFile) form.append("profilePicture", selectedFile);
    touristLicenseFiles.forEach(({ file }) =>
      form.append("touristLicense", file)
    );
    existingLicenses.forEach((license) =>
      form.append(
        "existingLicenses",
        license.replace(axiosInstance.defaults.baseURL, "")
      )
    );

    try {
      const response = await axiosInstance.patch(
        `/api/auth/edit-profile/${userId}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      response.status === 200
        ? alert("Profile updated successfully!")
        : alert(response.data.message || "Failed to update profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      error.response?.data?.errors
        ? setErrors(error.response.data.errors)
        : alert("An error occurred while updating profile");
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 1 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        Edit Profile
      </Typography>

      <Box sx={{ display: "flex", gap: 6 }}>
        {/* Left Column - Profile Picture */}
        <Box
          sx={{
            width: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            alt="Profile Picture"
            src={profilePicture}
            sx={{ width: 150, height: 150, mb: 2 }}
          />
          <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
            CHANGE PHOTO
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept="image/*"
            />
          </Button>
          <Typography variant="caption" color="text.secondary">
            JPG, PNG (Max 5MB)
          </Typography>
        </Box>

        {/* Right Column - Form */}
        <Box sx={{ flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "grid", gap: 2 }}>
              <TextField
                label="First Name *"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                size="small"
              />
              <TextField
                label="Last Name *"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                size="small"
              />
              <TextField
                label="Email *"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                size="small"
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <TextField
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="NIC"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                />
              </div>
              <TextField
                label="Address Line 1"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                size="small"
              />
              <TextField
                label="Address Line 2"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                size="small"
              />

              <Divider sx={{ my: 2 }} />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                size="small"
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                size="small"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Tourist Licenses (Max 4)
            </Typography>
            {existingLicenses.length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary">
                  Existing Licenses
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", my: 2 }}>
                  {existingLicenses.map((src, index) => (
                    <Box
                      key={index}
                      sx={{ position: "relative", cursor: "pointer" }}
                      onClick={() => openFile(src)}
                    >
                      <img
                        src={src}
                        alt={`License ${index}`}
                        style={{ width: 100, height: 100, objectFit: "cover" }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLicense(index, true);
                        }}
                        sx={{ position: "absolute", top: 0, right: 0 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {touristLicenseFiles.length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary">
                  New Uploads
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", my: 2 }}>
                  {touristLicenseFiles.map(({ preview }, index) => (
                    <Box
                      key={index}
                      sx={{ position: "relative", cursor: "pointer" }}
                      onClick={() => openFile(preview)}
                    >
                      <img
                        src={preview}
                        alt={`Uploaded ${index}`}
                        style={{ width: 100, height: 100, objectFit: "cover" }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLicense(index, false);
                        }}
                        sx={{ position: "absolute", top: 0, right: 0 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 1 }}
            >
              UPLOAD LICENSE IMAGES
              <input
                type="file"
                hidden
                multiple
                onChange={handleTouristLicenseChange}
                accept="image/*"
              />
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              You can upload up to{" "}
              {4 - (existingLicenses.length + touristLicenseFiles.length)} more
              images
            </Typography>

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 4 }}>
              SAVE CHANGES
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default EditProfile;
