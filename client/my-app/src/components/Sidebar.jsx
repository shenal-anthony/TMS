import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger Menu Button */}
      <IconButton
        onClick={() => setOpen(true)}
        sx={{ position: "fixed", top: 10, left: 10 }}
      >
        <MenuIcon />
      </IconButton>

      {/* Sidebar Drawer */}
      <Drawer open={open} onClose={() => setOpen(false)} anchor="left">
        <List>
          {["Home", "Bookings", "Profile"].map((text) => (
            <ListItem button key={text} onClick={() => setOpen(false)}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
