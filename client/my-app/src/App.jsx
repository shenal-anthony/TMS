import React from "react";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
// import GuideLayout from "./layouts/GuideLayout";
// import GuideDashboard from "./pages/GuideDashboard";

// Dummy role (replace with real auth logic)
const userRole = "admin"; // Change to "admin" for testing

function App() {
  return userRole === "admin" ? (
    <>
      <AdminLayout>
      <h2>Admin</h2>
        <AdminDashboard />
      </AdminLayout>
    </>
  ) : (
    <>
      <h1>Guide</h1>
      <GuideLayout>
        <GuideDashboard />
      </GuideLayout>
    </>
  );
}

export default App;
