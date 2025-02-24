import React from "react";
import {
  AppBar,
  IconButton,
  InputBase,
  Toolbar,
  Typography,
} from "@mui/material";
// import { SearchIcon, MenuIcon } from "@mui/icons-material";


const Header = () => {
  return (
    <AppBar position="fixed" sx={{ width: `calc(100% - 200px )`, ml: "240px" }}>
      <Toolbar>
        {/* <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="open drawer"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton> */}

        <Typography variant="h6">My Dashboard</Typography>
        {/* <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ "aria-label": "search" }}
          />
        </Search> */}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
