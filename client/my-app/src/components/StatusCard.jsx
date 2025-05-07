import { Box, Typography, Card, CardContent } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import React from "react";

const StatusCard = ({ title, value, icon }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  return (
    <Card sx={{ height: "100%", p: isSmallScreen ? 1 : 2 }}>
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          p: isSmallScreen ? "4px !important" : "8px !important",
        }}
      >
        <Box
          sx={{
            mr: isSmallScreen ? 1 : 2,
            color: "primary.main",
            fontSize: isSmallScreen ? "1.5rem" : isMediumScreen ? "1.75rem" : "2rem",
          }}
        >
          {React.cloneElement(icon, {
            fontSize: isSmallScreen ? "medium" : "large",
          })}
        </Box>
        <Box>
          <Typography
            variant={isSmallScreen ? "subtitle2" : "h6"}
            component="div"
            sx={{ lineHeight: 1.2 }}
          >
            {title}
          </Typography>
          <Typography
            variant={isSmallScreen ? "h6" : "h5"}
            component="div"
            sx={{
              fontWeight: "bold",
              fontSize: isSmallScreen ? "1.25rem" : isMediumScreen ? "1.5rem" : "1.75rem",
            }}
          >
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
