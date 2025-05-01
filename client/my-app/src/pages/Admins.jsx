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
  const apiUrl = import.meta.env.VITE_API_URL;

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
    if (!window.confirm("Are you sure you want to remove this guide?")) return;

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
      <div className="m-2">
        <h1>Admins List</h1>
      </div>
      <TableContainer component={Paper}>
        <Table>
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
                      backgroundColor: "#f5f5f5", // Light gray background on hover
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
                    <Button
                      variant="contained"
                      color="primary"
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
