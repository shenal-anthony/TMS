import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import BaseLayout from "./layouts/BaseLayout";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import Dashboard from "./pages/Dashboard";
import VehicleRegForm from "./pages/VehicleRegisterForm";
import Reports from "./pages/Reports";
import PendingBookings from "./pages/PendingBookings";
import ViewBookings from "./pages/ViewBookings";
import Admins from "./pages/Admins";
import Destinations from "./pages/Destinations";
import Events from "./pages/Events";
import GuideAvailability from "./pages/GuideAvailability";
import YourVehicles from "./pages/YourVehicles";
import ManageVehicles from "./pages/ManageVehicles";
import EditProfile from "./pages/EditProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import GuideLayout from "./layouts/GuideLayout";
import GuideDashboard from "./pages/GuideDashboard";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [authUser, setAuthUser] = useState(null);

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        newestOnTop
        draggable
        pauseOnHover
        transition={Slide}
        theme="light"
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/vehicleRegisterForm" element={<VehicleRegForm />} />

        {/* Protected Routes  */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              onAuthSuccess={(user) => setAuthUser(user)}
            />
          }
        >
          <Route element={<BaseLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings/pending" element={<PendingBookings />} />
            <Route path="/bookings/confirmed" element={<ViewBookings />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/contents/destinations" element={<Destinations />} />
            <Route path="/contents/events" element={<Events />} />
            <Route path="/guide-availability" element={<GuideAvailability />} />
            <Route path="/vehicles/your-vehicles" element={<YourVehicles />} />
            <Route
              path="/vehicles/manage-vehicles"
              element={<ManageVehicles />}
            />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["Guide"]}
              onAuthSuccess={(user) => setAuthUser(user)}
            />
          }
        >
          <Route element={<GuideLayout />}>
            <Route
              path="/guide-dashboard"
              element={<GuideDashboard userId={authUser?.userId} />}
            />
            <Route path="/guide-availability" element={<GuideAvailability />} />
            <Route path="/your-vehicles" element={<YourVehicles />} />
            <Route path="/manage-vehicles" element={<ManageVehicles />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
