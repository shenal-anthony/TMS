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

const GuideAvailability = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/guides`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setGuides(response.data);
        } else {
          setError("Response data is not an array");
        }
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching guides: " + error.message);
        setLoading(false);
      });
  }, []);

  const handleRemove = (id) => {
    axios
      .delete(`${apiUrl}/api/guides/${id}`)
      .then(() => {
        setGuides(guides.filter((guide) => guide.id !== id));
      })
      .catch((error) => {
        setError("Error deleting guide: " + error.message);
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
      <div className="m-4">
        <h1>Guide List</h1>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Guide ID</TableCell>
              <TableCell>first name</TableCell>
              <TableCell>last name</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guides
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((guide) => (
                <TableRow
                  key={guide.user_id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f5f5f5", // Light gray background on hover
                      cursor: "default",
                    },
                  }}
                >
                  <TableCell>{guide.user_id}</TableCell>
                  <TableCell>{guide.first_name}</TableCell>
                  <TableCell>{guide.last_name}</TableCell>
                  <TableCell>{guide.email_address}</TableCell>
                  <TableCell>{guide.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleRemove(guide.user_id)}
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
        count={guides.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
       <div className="m-4">
      <h1>Manage Availability</h1>
    </div>
    </div>
  );
};

export default GuideAvailability;