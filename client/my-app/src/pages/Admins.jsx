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
} from "@mui/material";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
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
    const apiUrl = import.meta.env.VITE_API_URL;
    axios
      .delete(`${apiUrl}/api/admins/${id}`)
      .then(() => {
        setAdmins(admins.filter((admin) => admin.id !== id));
      })
      .catch((error) => {
        setError("Error deleting admin: " + error.message);
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
      <h1>Admins List</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>first name</TableCell>
              <TableCell>last name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((admin) => (
                <TableRow
                  key={admin.user_id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f5f5f5", // Light gray background on hover
                      cursor: "default",
                    },
                  }}
                >
                  <TableCell>{admin.user_id}</TableCell>
                  <TableCell>{admin.first_name}</TableCell>
                  <TableCell>{admin.last_name}</TableCell>
                  <TableCell>{admin.email_address}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleRemove(admin.user_id)}
                    >
                      Remove
                    </Button>
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
    </div>
  );
};

export default Admins;
