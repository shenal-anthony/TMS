import React from "react";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AdminLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: "240px" }}>
        <Header />
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
