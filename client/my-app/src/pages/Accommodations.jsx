import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  MenuItem,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const Accommodations = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [formData, setFormData] = useState({
    accommodationName: "",
    locationUrl: "",
    contactNumber: "",
    amenities: "",
    serviceUrl: "",
    accommodationType: "hotel",
    picture: null,
  });
  const [picturePreview, setPicturePreview] = useState("");
  const [accommodationContents, setAccommodationContents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortField(field);

    const sorted = [...accommodationContents].sort((a, b) => {
      if (field === "id") {
        return isAsc
          ? a.accommodation_id - b.accommodation_id
          : b.accommodation_id - a.accommodation_id;
      } else {
        return isAsc
          ? a.accommodation_name.localeCompare(b.accommodation_name)
          : b.accommodation_name.localeCompare(a.accommodation_name);
      }
    });

    setAccommodationContents(sorted);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, picture: file });
      const reader = new FileReader();
      reader.onloadend = () => setPicturePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetAccommodationForm = () => {
    setFormData({
      accommodationName: "",
      locationUrl: "",
      contactNumber: "",
      amenities: "",
      serviceUrl: "",
      accommodationType: "hotel",
      picture: null,
    });
    setPicturePreview("");
    setCurrentId(null);
    setIsEditing(false);
  };

  const fetchAccommodations = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/contents/accommodations`);
      if (Array.isArray(response.data)) {
        setAccommodationContents(response.data);
      } else {
        setError("Response data is not an array");
      }
    } catch (err) {
      setError("Error fetching accommodations: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateAccommodation = () => {
    const formDataToSend = new FormData();
    formDataToSend.append("accommodationName", formData.accommodationName);
    formDataToSend.append("locationUrl", formData.locationUrl);
    formDataToSend.append("contactNumber", formData.contactNumber);
    formDataToSend.append("amenities", formData.amenities);
    formDataToSend.append("serviceUrl", formData.serviceUrl);
    formDataToSend.append("accommodationType", formData.accommodationType);

    if (formData.picture) {
      formDataToSend.append("accommodation", formData.picture);
    } else if (picturePreview) {
      formDataToSend.append("pictureUrl", picturePreview);
    }

    const request =
      isEditing && currentId
        ? axios.patch(
            `${apiUrl}/api/contents/accommodations/${currentId}`,
            formDataToSend,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          )
        : axios.post(`${apiUrl}/api/contents/accommodations`, formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" },
          });

    request
      .then((response) => {
        setModalMessage(
          response.data.message ||
            `Accommodation ${isEditing ? "updated" : "added"} successfully!`
        );
        setIsSuccess(true);
        fetchAccommodations();
        setDialogOpen(false);
        resetAccommodationForm();
      })
      .catch((err) => {
        setModalMessage("Error saving accommodation: " + err.message);
        setIsSuccess(false);
      })
      .finally(() => setModalOpen(true));
  };

  const handleRemoveAccommodation = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/contents/accommodations/${id}`);
      setAccommodationContents(
        accommodationContents.filter((acc) => acc.accommodation_id !== id)
      );
      setModalMessage("Accommodation deleted successfully!");
      setIsSuccess(true);
      setModalOpen(true);
    } catch (error) {
      setModalMessage("Error deleting accommodation: " + error.message);
      setIsSuccess(false);
      setModalOpen(true);
    }
  };

  const handleEditAccommodation = (acc) => {
    setFormData({
      accommodationName: acc.accommodation_name,
      locationUrl: acc.location_url,
      contactNumber: acc.contact_number,
      amenities: acc.amenities,
      serviceUrl: acc.service_url,
      accommodationType: acc.accommodation_type,
      picture: null,
    });
    setPicturePreview(acc.picture_url);
    setCurrentId(acc.accommodation_id);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (isSuccess) {
      resetAccommodationForm();
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchAccommodations();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="mb-4 mt-4">
        <Typography variant="h5">Accommodations</Typography>
        <div className="mt-4">
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              resetAccommodationForm();
              setDialogOpen(true);
            }}
          >
            Add Accommodation
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell align="center">
                <Button
                  onClick={() => handleSort("id")}
                  endIcon={
                    sortField === "id"
                      ? sortDirection === "asc"
                        ? " ⬆️"
                        : " ⬇️"
                      : null
                  }
                  sx={{ p: 0, textTransform: "none", fontWeight: "bold" }}
                >
                  ID
                </Button>
              </TableCell>
              <TableCell align="center">
                <Button
                  onClick={() => handleSort("accommodationName")}
                  endIcon={
                    sortField === "accommodationName"
                      ? sortDirection === "asc"
                        ? " ⬆️"
                        : " ⬇️"
                      : null
                  }
                  sx={{ p: 0, textTransform: "none", fontWeight: "bold" }}
                >
                  Name
                </Button>
              </TableCell>
              <TableCell align="center">Type</TableCell>
              <TableCell align="center">Contact</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accommodationContents.length > 0 ? (
              accommodationContents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((accommodation, index) => (
                  <TableRow
                    key={accommodation.accommodation_id}
                    sx={{
                      "&:hover td": {
                        backgroundColor: "#e3f2fd",
                      },
                    }}
                  >
                    <TableCell align="center">
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell align="center">
                      {accommodation.accommodation_id}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "150px",
                      }}
                    >
                      {accommodation.accommodation_name}
                    </TableCell>
                    <TableCell align="center">
                      {accommodation.accommodation_type}
                    </TableCell>
                    <TableCell align="center">
                      {accommodation.contact_number}
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEditAccommodation(accommodation)}
                        sx={{ mr: 1 }}
                      >
                        Update
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() =>
                          handleRemoveAccommodation(
                            accommodation.accommodation_id
                          )
                        }
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No accommodations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[8, 10, 25]}
        component="div"
        count={accommodationContents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 1 }}>
          {isEditing ? "Edit Accommodation" : "Add New Accommodation"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
            <TextField
              size="small"
              label="Accommodation Name *"
              name="accommodationName"
              value={formData.accommodationName}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              size="small"
              label="Location URL"
              name="locationUrl"
              value={formData.locationUrl}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              size="small"
              label="Contact Number *"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              size="small"
              select
              label="Type *"
              name="accommodationType"
              value={formData.accommodationType}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="hotel">Hotel</MenuItem>
              <MenuItem value="resort">Resort</MenuItem>
              <MenuItem value="bungalow">Bungalow</MenuItem>
              <MenuItem value="homestay">Homestay</MenuItem>
              <MenuItem value="villa">Villa</MenuItem>
              <MenuItem value="cabin">Cabin</MenuItem>
              <MenuItem value="cabana">Cabana</MenuItem>
              <MenuItem value="lodge">Lodge</MenuItem>
              <MenuItem value="camp">Camping Site</MenuItem>
              <MenuItem value="tent">Tent</MenuItem>
            </TextField>
            <TextField
              size="small"
              label="Amenities"
              name="amenities"
              multiline
              rows={4}
              value={formData.amenities}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              size="small"
              label="Service URL"
              name="serviceUrl"
              value={formData.serviceUrl}
              onChange={handleChange}
              fullWidth
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Accommodation Image
              </Typography>
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<CloudUploadIcon />}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              {picturePreview && (
                <Box
                  sx={{
                    mt: 2,
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                    bgcolor: "background.paper",
                  }}
                >
                  <img
                    src={picturePreview}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            size="small"
            onClick={handleAddOrUpdateAccommodation}
            sx={{ textTransform: "none" }}
            disabled={
              !formData.accommodationName ||
              !formData.contactNumber ||
              !formData.accommodationType
            }
          >
            {isEditing ? "Save Changes" : "Add Accommodation"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xs">
        <DialogTitle sx={{ p: 2, pb: 1 }}>
          {isSuccess ? "✅ Success" : "❌ Error"}
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 1 }}>
          <Button
            onClick={handleCloseModal}
            size="small"
            sx={{ textTransform: "none" }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Accommodations;
