import { Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import GuideSidebar from "../components/GuideSidebar"; // Import the GuideSidebar component

const GuideLayout = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if ("Guide" != role) {
    return <Navigate to="/login" />; // Redirect to login if not a Guide
  }

  return (
    <div className="h-screen flex flex-col fixed w-full">
      {/* Header at the top */}
      <Header toggleSidebar={() => setIsCollapsed(!isCollapsed)} role={role} />

      {/* Bottom part: Sidebar + Main Content */}
      <div className="flex flex-grow overflow-hidden">
        <GuideSidebar isCollapsed={isCollapsed} />

        {/* Main content on the right */}
        <main className="flex-grow p-6 overflow-y-auto">
          <Outlet /> {/* Pages will load here */}
        </main>
      </div>
    </div>
  );
};

export default GuideLayout;
