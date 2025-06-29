import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Checkbox,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  DirectionsCar as VehicleIcon,
  Book as BookingIcon,
  PendingActions as PendingIcon,
  Refresh as OngoingIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  AccountCircle as AccountIcon,
  SupervisorAccount as AdminIcon,
  Tour as TourIcon,
  Refresh as RefreshIcon,
  FollowTheSigns as GuideIcon,
  CheckCircle,
  CheckCircleOutline,
  CheckCircleOutlineRounded,
  CheckCircleOutlineTwoTone,
  CheckCircleOutlineOutlined,
} from "@mui/icons-material";
import dayjs from "dayjs";
import axiosInstance from "../api/axiosInstance";
import StatusCard from "../components/StatusCard";
import io from "socket.io-client";

const Dashboard = ({ userId }) => {
  const [statusCardsData, setStatusCardsData] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false); // Loading st
  const [guideRequests, setGuideRequests] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("booking_date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [requestSortField, setRequestSortField] = useState("sent_at");
  const [requestSortOrder, setRequestSortOrder] = useState("asc");
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const socketRef = useRef(null);
  const adminId = userId;
  const iconMap = {
    VehicleIcon: <VehicleIcon fontSize="medium" />,
    BookingIcon: <BookingIcon fontSize="medium" />,
    AdminIcon: <AdminIcon fontSize="medium" />,
    TourIcon: <TourIcon fontSize="medium" />,
    GuideIcon: <GuideIcon fontSize="medium" />,
  };

  const fetchStatusCardsData = async () => {
    try {
      setLoadingCards(true);
      const response = await axiosInstance.get(
        `${apiUrl}/api/reports/cards/${adminId}`
      );
      const data = response.data.map((item) => ({
        ...item,
        icon: iconMap[item.icon],
      }));
      setStatusCardsData(data);
      setLoadingCards(false);
    } catch (error) {
      console.error("Error fetching status card data:", error);
      setLoadingCards(false);
      setSnackbarError("Failed to fetch status card data.");
    }
  };

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL);
    socketRef.current.emit("join-room", "admin_room");
    socketRef.current.on("guide-response", () => {
      fetchGuideRequests();
    });

    const fetchGuideRequests = async () => {
      try {
        const requestData = await axiosInstance.get(
          `${apiUrl}/api/bookings/requests`
        );
        setGuideRequests(requestData.data);
      } catch (err) {
        console.error("Failed to fetch guide requests", err);
      }
    };

    const fetchData = async () => {
      try {
        await fetchGuideRequests(); // Fetch guide requests

        const bookingRes = await axiosInstance.get(
          `${apiUrl}/api/bookings/pending`
        );
        setBookings(bookingRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        sessionStorage.removeItem("accessToken");
        setError("Failed to fetch data.");
        setLoading(false);
        navigate("/login");
      }
    };

    fetchData();
    fetchStatusCardsData(adminId); // Fetch status card data
    return () => {
      socketRef.current.off("guide-response"); // Clean up event listener
      socketRef.current.disconnect(); // Clean up socket on unmount
    };
  }, [navigate, apiUrl]);

  const handleSort = (field) => {
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  const handleRequestSort = (field) => {
    const isAsc = requestSortField === field && requestSortOrder === "asc";
    setRequestSortField(field);
    setRequestSortOrder(isAsc ? "desc" : "asc");
  };

  const sortedGuideRequests = guideRequests.slice().sort((a, b) => {
    const valA = a[requestSortField];
    const valB = b[requestSortField];

    if (requestSortField === "updated_at") {
      const isAEmpty = !valA || valA === "Not yet updated";
      const isBEmpty = !valB || valB === "Not yet updated";

      if (isAEmpty && isBEmpty) return 0;
      if (isAEmpty) return requestSortOrder === "asc" ? 1 : -1;
      if (isBEmpty) return requestSortOrder === "asc" ? -1 : 1;

      const dateA = new Date(valA);
      const dateB = new Date(valB);

      return requestSortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }

    // default string/number sorting
    if (valA < valB) return requestSortOrder === "asc" ? -1 : 1;
    if (valA > valB) return requestSortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(bookingIds);
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSendRequest = (bookingId, guideId) => {
    const bookingData = {
      bookingId,
      guideId,
      sentAt: new Date().toISOString(),
    };
    socketRef.current.emit("send-guide-request", bookingData);
    console.log(`Assigning guide ${guideId} to booking ${bookingId}`);
    setSnackbarOpen(true); // Show success toast
  };

  const sendRequestsToAllGuides = () => {
    try {
      const requests = selected.flatMap((bookingId) => {
        const guides = groupedBookings[bookingId] || [];
        return guides.map((guide) => ({
          bookingId,
          guideId: guide.guide_id,
          sentAt: new Date(),
        }));
      });

      if (requests.length === 0) {
        setSnackbarError("No guides available for selected bookings.");
        return;
      }

      requests.forEach((data) => {
        socketRef.current.emit("send-guide-request", data);
      });

      console.log(`Sent ${requests.length} guide requests`);
      setSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      setSnackbarError("Failed to send guide requests.");
    }
  };

  // --- Utilities ---
  const groupedBookings = bookings.reduce((acc, booking) => {
    if (!acc[booking.booking_id]) acc[booking.booking_id] = [];
    acc[booking.booking_id].push(booking);
    return acc;
  }, {});

  const bookingIds = Object.keys(groupedBookings);

  const sortedBookingIds = [...bookingIds].sort((a, b) => {
    const aDate = dayjs(groupedBookings[a][0][sortField]);
    const bDate = dayjs(groupedBookings[b][0][sortField]);
    return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
  });

  const paginatedIds = sortedBookingIds.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const allSelectedOnPage = paginatedIds.every((id) => selected.includes(id));
  const someSelectedOnPage =
    paginatedIds.some((id) => selected.includes(id)) && !allSelectedOnPage;

  const isSelected = (id) => selected.includes(id);

  return (
    <div>
      <div>
        {/* Card overview */}
        <div>
          {/* --- Status Cards Section --- */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                Dashboard
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: "text.secondary", marginLeft: "2px" }}
              >
                Welcome to the dashboard! Here you can find an overview of your
                system.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.1 }}>
              <IconButton
                onClick={fetchStatusCardsData}
                disabled={loadingCards}
              >
                {loadingCards ? (
                  <CircularProgress size={24} />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
              <Typography
                variant="subtitle2"
                sx={{ color: "text.secondary", fontSize: "0.7rem" }}
              >
                Refresh Cards
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
            {statusCardsData.length > 0 ? (
              statusCardsData.map((card, index) => (
                <StatusCard
                  key={index}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                />
              ))
            ) : (
              <Typography variant="body1">No data available.</Typography>
            )}
          </Box>
        </div>

        <Divider sx={{ my: 3 }} />

        {/* add request table here  */}
        <div>
          {/* sent guide requests */}
          <div>
            {" "}
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Sent Guide Requests
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Shows guide requests sent by admin with their status
            </Typography>
          </div>

          {guideRequests.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No requests sent yet.
            </Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                mb: 4,
                maxHeight: 360, // Adjust based on row height (~8 rows)
                overflowY: "auto",
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">#</TableCell>
                    <TableCell align="center">
                      <Button
                        onClick={() => handleRequestSort("booking_id")}
                        endIcon={
                          requestSortField === "booking_id" &&
                          requestSortOrder === "asc"
                            ? " ⬆️"
                            : " ⬇️"
                        }
                      >
                        Booking ID
                      </Button>
                    </TableCell>
                    <TableCell align="center">Guide ID</TableCell>
                    <TableCell align="center">
                      <Button
                        onClick={() => handleRequestSort("sent_at")}
                        endIcon={
                          requestSortField === "sent_at" &&
                          requestSortOrder === "asc"
                            ? " ⬆️"
                            : " ⬇️"
                        }
                      >
                        Sent At
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        onClick={() => handleRequestSort("updated_at")}
                        endIcon={
                          requestSortField === "updated_at" &&
                          requestSortOrder === "asc"
                            ? " ⬆️"
                            : " ⬇️"
                        }
                      >
                        Updated At
                      </Button>
                    </TableCell>
                    <TableCell align="center">Response</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedGuideRequests.map((req, index) => (
                    <TableRow
                      key={`${req.booking_id}-${req.guide_id}`}
                      sx={{
                        height: 40,
                        "&:hover td": {
                          backgroundColor: "#e3f2fd !important",
                        },
                      }}
                    >
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{req.booking_id}</TableCell>
                      <TableCell align="center">{req.guide_id}</TableCell>
                      <TableCell align="center">
                        {dayjs(req.sent_at).format("YYYY-MM-DD HH:mm")}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color:
                            req.status === true
                              ? "royalblue"
                              : req.status === false
                              ? "gray"
                              : "gray",
                        }}
                      >
                        {req.updated_at === null
                          ? "Not yet updated"
                          : dayjs(req.updated_at).format("YYYY-MM-DD HH:mm")}
                      </TableCell>
                      <TableCell align="center">
                        {req.status === true ? (
                          <Chip
                            label="Accepted"
                            color="success"
                            size="small"
                            variant="filled"
                            icon={<CheckCircle />}
                            sx={{ borderRadius: "16px" }} // Oval-like shape
                          />
                        ) : (
                          <Chip
                            label="Pending"
                            color="warning"
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: "16px" }} // Oval-like shape
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>

        <Divider sx={{ my: 3 }} />

        {/* booking status */}
        <div>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Booking Status
          </Typography>
          <Typography variant="body1" sx={{ mb: -2 }}>
            Date view of pending bookings
          </Typography>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && bookingIds.length > 0 && (
        <>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={selected.length === 0}
              onClick={sendRequestsToAllGuides}
            >
              Send Requests to Selected ({selected.length})
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {/* check box  */}
                  <TableCell align="center" padding="checkbox">
                    <Checkbox
                      checked={allSelectedOnPage}
                      indeterminate={someSelectedOnPage}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell align="center">#</TableCell>
                  {/* booking Id  */}
                  <TableCell align="center">
                    <Button
                      onClick={() => handleSort("booking_id")}
                      endIcon={
                        sortField === "booking_id" && sortOrder === "asc"
                          ? " ⬆️"
                          : " ⬇️"
                      }
                    >
                      Booking ID
                    </Button>
                  </TableCell>
                  {/* booking date  */}
                  <TableCell align="center">
                    <Button
                      onClick={() => handleSort("booking_date")}
                      endIcon={
                        sortField === "booking_date" && sortOrder === "asc"
                          ? " ⬆️"
                          : " ⬇️"
                      }
                    >
                      Booking Date
                    </Button>
                  </TableCell>
                  <TableCell align="center">Availble Guide ID</TableCell>
                  <TableCell align="left">Available Guide Name</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedIds.map((bookingId) => (
                  <React.Fragment key={bookingId}>
                    {groupedBookings[bookingId].map((booking, index) => (
                      <TableRow
                        key={`${bookingId}-${booking.guide_id}`}
                        selected={isSelected(bookingId)}
                        sx={{
                          backgroundColor:
                            (paginatedIds.indexOf(bookingId) +
                              page * rowsPerPage) %
                              2 ===
                            0
                              ? "#f7f8f8" // light gray for even rows
                              : "inherit",
                          "&:hover td": {
                            backgroundColor: "#e3f2fd !important",
                          },
                        }}
                      >
                        <TableCell align="center" padding="checkbox">
                          {index === 0 && (
                            <Checkbox
                              checked={isSelected(bookingId)}
                              onChange={() => handleSelectRow(bookingId)}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {paginatedIds.indexOf(bookingId) +
                            1 +
                            page * rowsPerPage}
                        </TableCell>
                        <TableCell align="center">{bookingId}</TableCell>
                        <TableCell align="center">
                          {dayjs(booking.booking_date).format("YYYY-MM-DD")}
                        </TableCell>
                        <TableCell align="center">{booking.guide_id}</TableCell>
                        <TableCell align="left">
                          {booking.first_name} {booking.last_name}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() =>
                              handleSendRequest(bookingId, booking.guide_id)
                            }
                          >
                            Send Request
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[3, 5, 8]}
            component="div"
            count={bookingIds.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      )}

      {!loading && bookingIds.length === 0 && (
        <Typography variant="body1" style={{ marginTop: 20 }}>
          No pending bookings found.
        </Typography>
      )}
      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Guide requests sent successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!snackbarError}
        autoHideDuration={3000}
        onClose={() => setSnackbarError("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarError("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbarError}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Dashboard