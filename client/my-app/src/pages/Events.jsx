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
} from "@mui/material";
import dayjs from "dayjs";

const Events = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [eventFormData, setEventFormData] = useState({
    eventName: "",
    startDate: "",
    groupSize: "",
    description: "",
  });
  const [eventContents, setEventContents] = useState([]);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState(null);
  const [eventPage, setEventPage] = useState(0);
  const [eventRowsPerPage, setEventRowsPerPage] = useState(8);

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleAddOrUpdateEvent = () => {
    const formDataToSend = new FormData();
    Object.keys(eventFormData).forEach((key) => {
      if (eventFormData[key] !== null) {
        formDataToSend.append(key, eventFormData[key]);
      }
    });

    const request =
      isEditing && currentId
        ? axios.patch(
            `${apiUrl}/api/contents/events/${currentId}`,
            formDataToSend,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          )
        : axios.post(`${apiUrl}/api/contents/events`, formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" },
          });

    request
      .then((response) => {
        setModalMessage(
          response.data.message ||
            `Event ${isEditing ? "updated" : "registered"} successfully!`
        );
        setIsSuccess(true);
        fetchEvents();
        setEventDialogOpen(false);
        resetEventForm();
      })
      .catch((err) => {
        setModalMessage("Error saving event: " + err.message);
        setIsSuccess(false);
      })
      .finally(() => setModalOpen(true));
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

  const handleCloseModal = () => {
    setModalOpen(false);
    if (isSuccess) {
      resetEventForm();
    }
  };

  const handleEventChangePage = (event, newPage) => {
    setEventPage(newPage);
  };

  const handleEventChangeRowsPerPage = (event) => {
    setEventRowsPerPage(parseInt(event.target.value, 10));
    setEventPage(0);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (eventLoading) return <div>Loading...</div>;
  if (eventError) return <div>{eventError}</div>;

  return (
    <div>
      <div className="mb-4 mt-4">
        <Typography variant="h5">Events</Typography>
        <div className="mt-4">
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              resetEventForm();
              setEventDialogOpen(true);
            }}
          >
            Add Event
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Start Date</TableCell>
              <TableCell align="center">Group Size</TableCell>
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
                .map((event, index) => (
                  <TableRow
                    key={event.event_id}
                    sx={{
                      "&:hover td": {
                        backgroundColor: "#e3f2fd",
                      },
                    }}
                  >
                    <TableCell align="center">
                      {eventPage * eventRowsPerPage + index + 1}
                    </TableCell>
                    <TableCell align="center">{event.event_id}</TableCell>
                    <TableCell align="center">{event.event_name}</TableCell>
                    <TableCell align="center">
                      {dayjs(event.start_date).format("YYYY-MM-DD")}
                    </TableCell>
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

      <TablePagination
        rowsPerPageOptions={[8, 10, 25]}
        component="div"
        count={eventContents.length}
        rowsPerPage={eventRowsPerPage}
        page={eventPage}
        onPageChange={handleEventChangePage}
        onRowsPerPageChange={handleEventChangeRowsPerPage}
      />

      <Dialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{isEditing ? "Edit Event" : "Add Event"}</DialogTitle>
        <DialogContent>
          <TextField
            size="small"
            label="Event Name"
            name="eventName"
            value={eventFormData.eventName}
            onChange={handleEventChange}
            fullWidth
            margin="dense"
          />
          <TextField
            type="date"
            size="small"
            name="startDate"
            value={eventFormData.startDate}
            onChange={handleEventChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Group Size"
            name="groupSize"
            size="small"
            value={eventFormData.groupSize}
            onChange={handleEventChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Description"
            name="description"
            size="small"
            value={eventFormData.description}
            onChange={handleEventChange}
            multiline
            minRows={4}
            fullWidth
            style={{ marginTop: "10px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Cancel</Button>
          <Button color="primary" onClick={handleAddOrUpdateEvent}>
            {isEditing ? "Update" : "Add"}
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

export default Events;