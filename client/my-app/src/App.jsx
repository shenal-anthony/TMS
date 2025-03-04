import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BaseLayout from "./layouts/BaseLayout";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import Dashboard from "./pages/Dashboard";
// import VehicleRegForm from "./pages/VehicleRegisterForm";
import Reports from "./pages/Reports";
import PendingBookings from "./pages/PendingBookings";
import ViewBookings from "./pages/ViewBookings";
import Admins from "./pages/Admins";
import Contents from "./pages/Contents";
import GuideAvailability from "./pages/GuideAvailability";
import YourVehicles from "./pages/YourVehicles";
import ManageVehicles from "./pages/ManageVehicles";

// import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Protected Routes (Wrapped in BaseLayout) */}
        <Route element={<BaseLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings/pending" element={<PendingBookings />} />
          <Route path="/bookings/confirmed" element={<ViewBookings />} />
          <Route path="/admins" element={<Admins />} />
          <Route path="/contents" element={<Contents />} />
          <Route path="/guide-availability" element={<GuideAvailability />} />
          <Route path="/vehicles/your-vehicles" element={<YourVehicles />} />
          <Route path="/vehicles/manage-vehicles" element={<ManageVehicles />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
