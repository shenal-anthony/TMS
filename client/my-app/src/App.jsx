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
// import Events from "./pages/Events";
import GuideAvailability from "./pages/GuideAvailability";
import YourVehicles from "./pages/YourVehicles";
import ManageVehicles from "./pages/ManageVehicles";
import EditProfile from "./pages/EditProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import GuideLayout from "./layouts/GuideLayout";
import GuideDashboard from "./pages/GuideDashboard";
import Tours from "./pages/Tours";
import GuideReports from "./pages/GuideReports";
// import Feedbacks from "./pages/Feedbacks";
import Packages from "./pages/Packages";
import Tour from "./pages/Tour";

import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Accommodations from "./pages/Accommodations";

const App = () => {
  const [authUser, setAuthUser] = useState(null);

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        closeOnClick
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
        <Route path="/vehicleRegisterForm" element={<VehicleRegForm />} />

        {/* Protected Routes for admin */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["Admin", "SuperAdmin"]}
              onAuthSuccess={(user) => setAuthUser(user)}
            />
          }
        >
          <Route element={<BaseLayout role={authUser?.role} />}>
            <Route
              path="/dashboard"
              element={<Dashboard userId={authUser?.userId} />}
            />
            <Route path="/bookings/pending" element={<PendingBookings />} />
            <Route
              path="/bookings/confirmed"
              element={
                <ViewBookings userId={authUser?.userId} role={authUser?.role} />
              }
            />
            <Route
              path="/admins"
              element={
                <Admins userId={authUser?.userId} role={authUser?.role} />
              }
            />
            <Route path="/contents/destinations" element={<Destinations />} />
            <Route path="/contents/packages" element={<Packages />} />
            <Route
              path="/contents/accommodations"
              element={<Accommodations />}
            />
            {/* <Route path="/contents/events" element={<Events />} /> */}
            <Route path="/contents/tour" element={<Tour />} />
            <Route path="/guide-availability" element={<GuideAvailability />} />
            <Route
              path="/vehicles/your-vehicles"
              element={<YourVehicles userId={authUser?.userId} />}
            />
            <Route
              path="/vehicles/manage-vehicles"
              element={<ManageVehicles userId={authUser?.userId} />}
            />
            <Route
              path="/reports"
              element={<Reports userId={authUser?.userId} />}
            />
            <Route
              path="/edit-profile"
              element={<EditProfile userId={authUser?.userId} />}
            />
          </Route>
        </Route>

        {/* Protected routes for Guide role */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["Guide"]}
              onAuthSuccess={(user) => setAuthUser(user)}
            />
          }
        >
          <Route element={<GuideLayout role={authUser?.role} />}>
            <Route
              path="/guide-dashboard"
              element={<GuideDashboard userId={authUser?.userId} />}
            />
            <Route
              path="/Tours"
              element={<Tours userId={authUser?.userId} />}
            />
            {/* <Route
              path="/Feedbacks"
              element={<Feedbacks userId={authUser?.userId} />}
            /> */}
            <Route
              path="/your-vehicles"
              element={<YourVehicles userId={authUser?.userId} />}
            />
            <Route
              path="/guide-reports"
              element={<GuideReports userId={authUser?.userId} />}
            />
            <Route
              path="/guide/edit-profile"
              element={<EditProfile userId={authUser?.userId} />}
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
