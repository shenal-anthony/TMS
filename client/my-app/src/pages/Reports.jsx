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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
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

const Reports = ({ userId }) => {
  const [startDate, setStartDate] = useState(
    dayjs().startOf("day").subtract(1, "month")
  );
  const [endDate, setEndDate] = useState(dayjs().startOf("day"));
  const [reportType, setReportType] = useState("Bookings");
  const [downloadType, setDownloadType] = useState("PDF");
  const [chartData, setChartData] = useState([]);

  const adminId = userId; //

  const [previousReports, setPreviousReports] = useState([
    { id: "RPT-001", date: "2025-04-25" },
    { id: "RPT-002", date: "2025-04-20" },
    { id: "RPT-003", date: "2025-04-10" },
  ]);

  const dataKey = reportType.toLowerCase();

  const fetchChartData = async (adminId) => {
    try {
      const response = await axiosInstance.get(
        `/api/reports/charts/${adminId}`,
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

  const handleDownload = () => {
    const newId = `RPT-${String(previousReports.length + 1).padStart(3, "0")}`;
    const today = dayjs().format("YYYY-MM-DD");
    const newReport = { id: newId, date: today };
    setPreviousReports((prev) => [newReport, ...prev]);
    alert(`Downloaded ${reportType} report as ${downloadType}`);
  };

  useEffect(() => {
    fetchChartData(adminId);
  }, [startDate, endDate]);

  return (
    <Box>
      {/* Header - Full Width */}
      <div style={{ textAlign: "left", marginBottom: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Tourist Management Reports
        </Typography>
      </div>

      {/* Filters - Full Width */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={3}
        flexWrap="wrap"
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date"
            value={startDate}
            slotProps={{ textField: { size: "small" } }}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            slotProps={{ textField: { size: "small" } }}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
        </LocalizationProvider>

        <TextField
          select
          label="Report Type"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          size="small"
        >
          <MenuItem value="Revenue">Revenue</MenuItem>
          <MenuItem value="Tourists">Tourists</MenuItem>
          <MenuItem value="Bookings">Bookings</MenuItem>
        </TextField>

        <TextField
          select
          label="Download Type"
          value={downloadType}
          onChange={(e) => setDownloadType(e.target.value)}
          size="small"
        >
          <MenuItem value="PDF">PDF</MenuItem>
          <MenuItem value="Excel">Excel</MenuItem>
        </TextField>

        <div style={{ flexGrow: 1, margin: "10px" }}>
          <Button variant="contained" onClick={handleDownload}>
            Download
          </Button>
        </div>
      </Stack>

      {/* Report + History Row */}
      <Box display="flex" gap={2}>
        {/* Chart Section */}
        <Paper elevation={2} sx={{ flex: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {reportType} Report
          </Typography>
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
        </Paper>

        {/* Report History */}
        <Paper elevation={2} sx={{ flex: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Previous Reports
          </Typography>
          <List dense>
            {previousReports.map((report) => (
              <React.Fragment key={report.id}>
                <ListItem>
                  <ListItemText
                    primary={`Report ID: ${report.id}`}
                    secondary={`Generated: ${report.date}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default Reports;
