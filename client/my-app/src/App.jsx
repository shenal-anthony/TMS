import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { themeSettings } from "./theme";
// import { state } from "./state/index";

import BaseLayout from "./layouts/BaseLayout";
import Dashboard from "./pages/Dashboard";

function App() {
  // const mode = useSelector((state) => state.global.mode);
  // const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return (
    <div className="app">
      <Router>
        {/* <ThemeProvider theme={theme}> */}
          {/* <CssBaseline /> */}
          <Routes>
            {/* Public Routes */}
            {/* <Route path="/login" element={<LoginForm />} /> */}
            {/* 
        
        <Route path="/register" element={<RegisterForm />} /> */}

            {/* Protected Routes (Wrapped in BaseLayout) */}
            <Route element={<BaseLayout />}>
              <Routes path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* <Route path="bookings/pending" element={<PendingBookings />} /> */}
              {/* <Route path="bookings/confirmed" element={<ConfirmedBookings />} /> */}
              {/* <Route path="/vehicleregister" element={<VehicleRegForm />} /> */}
              {/* <Route path="/users" element={<Users />} />
          <Route path="/reports" element={<Reports />} /> */}
            </Route>
          </Routes>
        {/* </ThemeProvider> */}
      </Router>
    </div>
  );
}

export default App;
