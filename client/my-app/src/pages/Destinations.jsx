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
} from "@mui/material";

const Destinations = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDestination, setCurrentDestination] = useState({
    destinationName: "",
    description: "",
    weatherCondition: "",
    locationUrl: "",
    pictureUrl: "",
  });
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = () => {
    axios
      .get(`${apiUrl}/api/tourists/destinations`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setContents(response.data);
        } else {
          setError("Response data is not an array");
        }
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching contents: " + error.message);
        setLoading(false);
      });
  };

  const handleRemove = (id) => {
    axios
      .delete(`${apiUrl}/api/tourists/destinations/${id}`)
      .then(() => {
        setContents(
          contents.filter((destination) => destination.destination_id !== id)
        );
      })
      .catch((error) => {
        setError("Error deleting destination: " + error.message);
      });
  };

  const handleAddOrUpdateDestination = () => {
    if (isEditing) {
      // Update existing destination
      axios
        .put(
          `${apiUrl}/api/tourists/destinations/${currentDestination.destination_id}`,
          currentDestination
        )
        .then((response) => {
          setContents(
            contents.map((destination) =>
              destination.destination_id === currentDestination.destination_id
                ? response.data
                : destination
            )
          );
          setOpenDialog(false);
          resetForm();
        })
        .catch((error) => {
          setError("Error updating destination: " + error.message);
        });
    } else {
      // Add new destination
      axios
        .post(`${apiUrl}/api/tourists/destinations`, currentDestination)
        .then((response) => {
          setContents([...contents, response.data]);
          setOpenDialog(false);
          resetForm();
        })
        .catch((error) => {
          setError("Error adding destination: " + error.message);
        });
    }
  };

  const handleEdit = (destination) => {
    setCurrentDestination({
      destination_id: destination.destination_id,
      destinationName: destination.destination_name,
      description: destination.description,
      weatherCondition: destination.weather_condition,
      locationUrl: destination.location_url,
      pictureUrl: destination.picture_url,
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setCurrentDestination({
      destinationName: "",
      description: "",
      weatherCondition: "",
      locationUrl: "",
      pictureUrl: "",
    });
    setIsEditing(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="mb-4 mt-4">
        <h1>Destination List</h1>
        <div className="mt-4">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
          >
            Add New Destination
          </Button>
        </div>
      </div>

      {/* Add/Edit Destination Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          resetForm();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {isEditing ? "Edit Destination" : "Add New Destination"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Destination Name"
            fullWidth
            value={currentDestination.destinationName}
            onChange={(e) =>
              setCurrentDestination({
                ...currentDestination,
                destinationName: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={currentDestination.description}
            onChange={(e) =>
              setCurrentDestination({
                ...currentDestination,
                description: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label="Weather Condition"
            fullWidth
            value={currentDestination.weatherCondition}
            onChange={(e) =>
              setCurrentDestination({
                ...currentDestination,
                weatherCondition: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label="Location URL"
            fullWidth
            value={currentDestination.locationUrl}
            onChange={(e) =>
              setCurrentDestination({
                ...currentDestination,
                locationUrl: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label="Picture URL"
            fullWidth
            value={currentDestination.pictureUrl}
            onChange={(e) =>
              setCurrentDestination({
                ...currentDestination,
                pictureUrl: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddOrUpdateDestination} color="primary">
            {isEditing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Destinations Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Destination ID</TableCell>
              <TableCell>Destination Name</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((destination) => (
                <TableRow
                  key={destination.destination_id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      cursor: "default",
                    },
                  }}
                >
                  <TableCell>{destination.destination_id}</TableCell>
                  <TableCell>{destination.destination_name}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEdit(destination)}
                    >
                      Update
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleRemove(destination.destination_id)}
                      style={{ marginLeft: "10px" }}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[8, 10, 25]}
        component="div"
        count={contents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <div>
        <h1>Destination List</h1>
      </div>
    </div>
  );
};

export default Destinations;