import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BaseLayout from "./layouts/BaseLayout";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import Dashboard from "./pages/Dashboard";
import VehicleRegForm from "./pages/VehicleRegisterForm";
import ProtectedRoute from "./components/ProtectedRoute";

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
          <Route path="/vehicleregister" element={<VehicleRegForm />} />
          {/* <Route path="/users" element={<Users />} />
          <Route path="/reports" element={<Reports />} /> */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
