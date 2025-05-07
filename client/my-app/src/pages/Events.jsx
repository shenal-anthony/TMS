import { useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  MenuItem,
  Container,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import { Textarea } from "@mui/joy";

const Events = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // Accommodation Form state
  const [formData, setFormData] = useState({
    accommodationName: "",
    locationUrl: "",
    contactNumber: "",
    amenities: "",
    serviceUrl: "",
    accommodationType: "hotel",
    picture: null,
  });

  // Event Form state
  const [eventFormData, setEventFormData] = useState({
    eventName: "",
    startDate: "",
    groupSize: "",
    description: "",
  });
  const [picturePreview, setPicturePreview] = useState("");
  const [accommodationContents, setAccommodationContents] = useState([]);
  const [eventContents, setEventContents] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(true);

  const [error, setError] = useState(null);
  const [eventError, setEventError] = useState(null);

  const [page, setPage] = useState(0);
  const [eventPage, setEventPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [eventRowsPerPage, setEventRowsPerPage] = useState(8);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventFormData((prev) => ({ ...prev, [name]: value }));
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

  const resetForm = () => {
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

  const resetEventForm = () => {
    setEventFormData({
      eventName: "",
      startDate: "",
      groupSize: "",
      description: "",
    });
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

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/contents/events`);
      if (Array.isArray(response.data)) {
        setEventContents(response.data);
      } else {
        setEventError("Response data is not an array");
      }
    } catch (err) {
      setEventError("Error fetching events: " + err.message);
    } finally {
      setEventLoading(false);
    }
  };

  useEffect(() => {
    fetchAccommodations();
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("accommodationName", formData.accommodationName);
    formDataToSend.append("locationUrl", formData.locationUrl);
    formDataToSend.append("contactNumber", formData.contactNumber);
    formDataToSend.append("amenities", formData.amenities);
    formDataToSend.append("serviceUrl", formData.serviceUrl);
    formDataToSend.append("accommodationType", formData.accommodationType);
    formDataToSend.append("folder", "accommodations");

    if (formData.picture) {
      formDataToSend.append("file", formData.picture);
    } else if (picturePreview) {
      formDataToSend.append("pictureUrl", picturePreview);
    }

    const request =
      isEditing && currentId
        ? axios.put(
            `${apiUrl}/api/contents/accommodations/${currentId}`,
            formDataToSend
          )
        : axios.post(`${apiUrl}/api/contents/accommodations`, formDataToSend);

    request
      .then((response) => {
        setModalMessage(
          response.data.message ||
            `Accommodation ${isEditing ? "updated" : "added"} successfully!`
        );
        setIsSuccess(true);
        fetchAccommodations();
        setDialogOpen(false);
        resetForm();
      })
      .catch((err) => {
        setModalMessage("Error saving accommodation: " + err.message);
        setIsSuccess(false);
      })
      .finally(() => setModalOpen(true));
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(eventFormData).forEach((key) => {
      if (eventFormData[key] !== null) {
        formDataToSend.append(key, eventFormData[key]);
      }
    });

    try {
      const url =
        isEditing && currentId
          ? `${apiUrl}/api/contents/events/${currentId}`
          : `${apiUrl}/api/contents/events`;

      const method = isEditing ? "put" : "post";

      const response = await axios[method](url, formDataToSend);

      setModalMessage(
        response.data.message ||
          `Event ${isEditing ? "updated" : "registered"} successfully!`
      );
      setIsSuccess(true);
      setModalOpen(true);
      fetchEvents();
      setEventDialogOpen(false);
      resetEventForm();
    } catch (error) {
      console.error("Error:", error);
      setModalMessage(
        error.response?.data?.message ||
          "An error occurred during the operation."
      );
      setIsSuccess(false);
      setModalOpen(true);
    }
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

  const handleRemoveEvent = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/contents/events/${id}`);
      setEventContents(eventContents.filter((event) => event.event_id !== id));
      setModalMessage("Event deleted successfully!");
      setIsSuccess(true);
      setModalOpen(true);
    } catch (error) {
      setModalMessage("Error deleting event: " + error.message);
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

  const handleEditEvent = (event) => {
    setEventFormData({
      eventName: event.event_name,
      startDate: event.start_date,
      groupSize: event.group_size,
      description: event.description,
    });
    setCurrentId(event.event_id);
    setIsEditing(true);
    setEventDialogOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (isSuccess) {
      resetAccommodationForm();
      resetEventForm();
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleEventChangePage = (event, newPage) => {
    setEventPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEventChangeRowsPerPage = (event) => {
    setEventRowsPerPage(parseInt(event.target.value, 10));
    setEventPage(0);
  };

  if (loading || eventLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (eventError) return <div>{eventError}</div>;

  return (
    <div>
      {/* accommodation part  */}
      <div>
        <div className="mb-4 mt-4">
          <h1>Accommodations</h1>
          <Button
            variant="contained"
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            Add Accommodation
          </Button>
        </div>

        {/* Accommodation Table */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accommodationContents.length > 0 ? (
                accommodationContents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((accommodation) => (
                    <TableRow key={accommodation.accommodation_id} hover>
                      <TableCell>{accommodation.accommodation_id}</TableCell>
                      <TableCell>{accommodation.accommodation_name}</TableCell>
                      <TableCell>{accommodation.accommodation_type}</TableCell>
                      <TableCell>{accommodation.contact_number}</TableCell>
                      <TableCell style={{ display: "flex" }}>
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
                  <TableCell colSpan={4} align="center">
                    No vehicles found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[8, 10, 25]}
          component="div"
          count={accommodationContents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        {/* Add/Edit Accommodation Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {isEditing ? "Edit Accommodation" : "Add Accommodation"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Accommodation Name"
              name="accommodationName"
              value={formData.accommodationName}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Location URL"
              name="locationUrl"
              value={formData.locationUrl}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Amenities"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Service URL"
              name="serviceUrl"
              value={formData.serviceUrl}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              select
              label="Type"
              name="accommodationType"
              value={formData.accommodationType}
              onChange={handleChange}
              fullWidth
              margin="dense"
            >
              <MenuItem value="hotel">Hotel</MenuItem>
              <MenuItem value="resort">Resort</MenuItem>
              <MenuItem value="apartment">Apartment</MenuItem>
            </TextField>

            <div style={{ marginTop: "10px" }}>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {picturePreview && (
                <img
                  src={picturePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    marginTop: "10px",
                  }}
                />
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button color="primary">{isEditing ? "Update" : "Add"}</Button>
          </DialogActions>
        </Dialog>

        {/* Message Modal */}
        <Dialog open={modalOpen} onClose={handleCloseModal}>
          <DialogTitle>{isSuccess ? "Success" : "Error"}</DialogTitle>
          <DialogContent>
            <Typography>{modalMessage}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <Divider sx={{ my: 3 }} />

      {/* event part */}
      <div>
        <div className="mb-4 mt-4">
          <h1>Events</h1>
          <Button
            variant="contained"
            onClick={() => {
              resetEventForm();
              setEventDialogOpen(true);
            }}
          >
            Add Event
          </Button>
        </div>
        {/* Event Table */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Start Date</TableCell>
                <TableCell align="center">Group size</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventContents.length > 0 ? (
                eventContents
                  .slice(
                    eventPage * eventRowsPerPage,
                    eventPage * eventRowsPerPage + eventRowsPerPage
                  )
                  .map((event) => (
                    <TableRow key={event.event_id} hover>
                      <TableCell align="center">{event.event_id}</TableCell>
                      <TableCell align="center">{event.event_id}</TableCell>
                      {/* change to event name */}
                      <TableCell align="center">{event.start_date}</TableCell>
                      <TableCell align="center">{event.group_size}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => handleRemoveEvent(event.event_id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No Events found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[8, 10, 25]}
          component="div"
          count={eventContents.length}
          rowsPerPage={eventRowsPerPage}
          page={eventPage}
          onPageChange={handleEventChangePage}
          onRowsPerPageChange={handleEventChangeRowsPerPage}
        />

        {/* Add/Edit Dialog */}
        <Dialog
          open={eventDialogOpen}
          onClose={() => setEventDialogOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>{isEditing ? "Edit Event" : "Add Event"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Event Name"
              name="eventName"
              value={eventFormData.eventName}
              onChange={handleEventChange}
              fullWidth
              margin="dense"
            />
            <TextField
              type="date"
              name="startDate"
              value={eventFormData.startDate}
              onChange={handleEventChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Group Size"
              name="groupSize"
              value={eventFormData.groupSize}
              onChange={handleEventChange}
              fullWidth
              margin="dense"
            />
            <Textarea
              placeholder="Description"
              name="description"
              value={eventFormData.description}
              onChange={handleEventChange}
              minRows={3}
              maxRows={5}
              fullWidth
              style={{ marginTop: "10px" }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEventDialogOpen(false)}>Cancel</Button>
            <Button color="primary">{isEditing ? "Update" : "Add"}</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Events;
