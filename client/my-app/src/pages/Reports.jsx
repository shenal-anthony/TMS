import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  DialogActions,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const Reports = ({ userId }) => {
  const [startDate, setStartDate] = useState(dayjs().subtract(1, "month"));
  const [endDate, setEndDate] = useState(dayjs());
  const [reportType, setReportType] = useState("Bookings");
  const [downloadType, setDownloadType] = useState("PDF");
  const [chartData, setChartData] = useState([]);
  const [previousReports, setPreviousReports] = useState([]);
  const [currentReportDetails, setCurrentReportDetails] = useState(null);
  const [comment, setComment] = useState("");
  const dataKey = reportType.toLowerCase();

  const fetchChartData = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/reports/charts/${userId}`,
        {
          params: {
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
          },
        }
      );
      setChartData(response.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const fetchPreviousReports = async () => {
    try {
      const response = await axiosInstance.get(`/api/reports/logs/${userId}`);
      setPreviousReports(response.data);
    } catch (error) {
      console.error("Error fetching previous reports:", error);
    }
  };

  const handleViewReport = async (report_id) => {
    try {
      const response = await axiosInstance.get(
        `/api/reports/view/${report_id}`
      );
      const report = response.data;
      setCurrentReportDetails(report);
      setChartData(JSON.parse(report.report_data));
      setComment(report.comment); // Update comment state
    } catch (error) {
      console.error("Error fetching report details:", error);
    }
  };

  const handleStoreReport = async () => {
    if (!window.confirm("Are you sure you want to store this report?")) {
      return;
    }
    try {
      const reportDetails = {
        generated_date: dayjs().toISOString(),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        comment,
        report_data: JSON.stringify(chartData),
        report_type: reportType.toLowerCase(),
        user_id: userId,
      };

      await axiosInstance.post("/api/reports/store", reportDetails);
      alert("Report stored successfully!");
      setComment("");
      fetchPreviousReports();
    } catch (error) {
      console.error("Error storing report:", error);
    }
  };

  const handleDownloadReport = async () => {
    if (!window.confirm("Are you sure you want to download this report?")) {
      return;
    }

    try {
      const reportDetails = {
        generated_date: dayjs().toISOString(),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        comment,
        report_data: JSON.stringify(chartData),
        report_type: reportType.toLowerCase(),
        user_id: userId,
        downloadType, // Add this to tell server whether PDF or Excel
      };

      const response = await axiosInstance.post(
        "/api/reports/download",
        reportDetails,
        {
          responseType: "blob", // Important for file download
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report.${downloadType.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  const handleGoBack = () => {
    setCurrentReportDetails(null);
    setComment("");
  };

  useEffect(() => {
    fetchChartData();
    fetchPreviousReports();
  }, [startDate, endDate, reportType]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tourist Management Reports
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        rowGap={2}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            slotProps={{ textField: { size: "small" } }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            slotProps={{ textField: { size: "small" } }}
          />
        </LocalizationProvider>

        <TextField
          select
          label="Report Type"
          value={reportType}
          onChange={(e) => {
            setReportType(e.target.value);
          }}
          size="small"
          sx={{ minWidth: 120 }}
          disabled={!!currentReportDetails}
        >
          <MenuItem value="Revenue">Revenue</MenuItem>
          <MenuItem value="Tourists">Tourists</MenuItem>
          <MenuItem value="Bookings">Bookings</MenuItem>
        </TextField>

        <TextField
          select
          label="Download Format"
          value={downloadType}
          onChange={(e) => setDownloadType(e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
          disabled={!!currentReportDetails}
        >
          <MenuItem value="PDF">PDF</MenuItem>
          <MenuItem value="Xlsx">Excel</MenuItem>
        </TextField>

        {currentReportDetails ? (
          <Button variant="outlined" color="secondary" onClick={handleGoBack}>
            Go Back
          </Button>
        ) : (
          <>
            <Button variant="contained" onClick={handleStoreReport}>
              Store Report
            </Button>
            <Button variant="outlined" onClick={handleDownloadReport}>
              Download Report
            </Button>
          </>
        )}
      </Stack>

      <Box display="flex" gap={2} flexWrap="wrap">
        {/* Chart Section */}
        <Paper elevation={2} sx={{ flex: 3, p: 2, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            {reportType} Report
            {currentReportDetails && (
              <span style={{ fontSize: "0.8em", marginLeft: "1rem" }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  component="span"
                >
                  (Viewing report ID: {currentReportDetails.report_id})
                </Typography>
              </span>
            )}
          </Typography>

          <Box sx={{ overflowY: "auto", flexGrow: 1, paddingRight: 3 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={dataKey} fill="#1976d2" name={reportType} />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <TextField
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={{ mt: 2 }}
            placeholder="Add a comment"
            disabled={!!currentReportDetails}
          />
        </Paper>

        {/* Previous Reports Section */}
        <Paper
          elevation={2}
          sx={{
            flex: 1,
            p: 2,
            minWidth: 250,
            maxHeight: 500,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Previous Reports
          </Typography>

          <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
            <List dense>
              {previousReports.length > 0 ? (
                previousReports.map((report, index) => (
                  <React.Fragment key={report.report_id}>
                    <ListItem>
                      <Typography sx={{ width: 30 }}>{index + 1}</Typography>
                      <ListItemText
                        primary={`Report ID: ${report.report_id}`}
                        secondary={
                          <span>
                            Type: {report.report_type} <br />
                            Date:{" "}
                            {dayjs(report.generated_date).format("YYYY-MM-DD")}
                          </span>
                        }
                      />
                      <Button
                        variant="text"
                        onClick={() => handleViewReport(report.report_id)}
                      >
                        View
                      </Button>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No reports available.
                </Typography>
              )}
            </List>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Reports;
