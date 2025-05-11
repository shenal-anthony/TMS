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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";

const Admins = ({ userId, role }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const apiUrl = import.meta.env.VITE_API_URL;
  const userRole = role;

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/admins`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setAdmins(response.data);
        } else {
          setError("Response data is not an array");
        }
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching admins: " + error.message);
        setLoading(false);
      });
  }, []);

  const handleRemove = (id) => {
    if (!window.confirm(`Are you sure you want to remove admin: ${id} ?`))
      return;

    axios
      .delete(`${apiUrl}/api/admins/${id}`)
      .then(() => {
        setAdmins(admins.filter((admin) => admin.id !== id));
      })
      .catch((error) => {
        setError("Error deleting admin: " + error.message);
      });
  };

  const handleView = (id) => {
    axios
      .get(`${apiUrl}/api/admins/${id}`)
      .then((response) => {
        setSelectedAdmin(response.data);
        setOpenDialog(true);
      })
      .catch((error) => {
        setError("Error fetching admin details: " + error.message);
      });
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
      <div className="m-2">
        <h1>Admins List</h1>
      </div>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((admin, index) => (
                <TableRow
                  key={admin.user_id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      cursor: "default",
                    },
                  }}
                >
                  <TableCell align="center">
                    {index + 1 + page * rowsPerPage}
                  </TableCell>
                  <TableCell align="center">{admin.user_id}</TableCell>
                  <TableCell align="center">{`${admin.first_name} ${admin.last_name}`}</TableCell>
                  <TableCell align="center">{admin.email_address}</TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleView(admin.user_id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        disabled={userRole !== "SuperAdmin"}
                        onClick={() => handleRemove(admin.user_id)}
                      >
                        Remove
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[8, 10, 25]}
        component="div"
        count={admins.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Admin Details</DialogTitle>
        <DialogContent>
          {selectedAdmin ? (
            <div>
              <Typography variant="body1">
                <strong>Name:</strong>{" "}
                {`${selectedAdmin.first_name} ${selectedAdmin.last_name}`}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {selectedAdmin.email_address}
              </Typography>
              <Typography variant="body1">
                <strong>Contact Number:</strong> {selectedAdmin.contact_number}
              </Typography>
              <Typography variant="body1">
                <strong>NIC Number:</strong> {selectedAdmin.nic_number}
              </Typography>
              <Typography variant="body1">
                <strong>Address:</strong>{" "}
                {`${selectedAdmin.addressline_01}, ${selectedAdmin.addressline_02}`}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong> {selectedAdmin.status}
              </Typography>
              {selectedAdmin.profile_picture && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={`${apiUrl}${selectedAdmin.profile_picture}`}
                    alt="Profile"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <Typography>Loading admin details...</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            color="primary"
            variant="text"
            size="small"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Admins;
