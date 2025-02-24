import React from "react";
import { Typography, Paper } from "@mui/material";

const GuideDashboard = () => {
  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, textAlign: { xs: "center", md: "left" } }}>
      <Typography variant="h5">Welcome, Guide</Typography>
    </Paper>
  );
};

export default GuideDashboard;
