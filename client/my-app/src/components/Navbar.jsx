import React, { useState } from "react";
import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Search,
  SettingsOutlined,
  ArrowDropDownOutlined,
} from "@mui/icons-material";
// import FlexBetween from "./components/FlexBetween";
import { useDispatch } from "react-redux";
import { setMode } from "../state";
// import profileImage from "../assets/profile.jpg";
import {
  AppBar,
  Button,
  Box,
  Typography,
  IconButton,
  InputBase,
  Toolbar,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";

const Navbar = () => {
  return (
    
    <AppBar sx={{ position: "static", background: "none", boxShadow: "none" }}>
    <Toolbar sx={{ justifyContent: "space-between" }}>
    <FlexBetween>
        <IconButton onClick={() => console.log('open/close sidebar')}>
            <MenuIcon />
        </IconButton>
        <FlexBetween backgroundColor={theme.plaette.background.alt} borderRadius="9px" gap="3rem" p="0.1rem 1.5rem">
        <InputBase placeholder="Search...">
        <IconButton>
              <Search />
            </IconButton>

        </InputBase>
            
        </FlexBetween>
    </FlexBetween>
    </Toolbar>
    </AppBar>
  )
};

export default Navbar;