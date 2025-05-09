import { Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const BaseLayout = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (role !== "Admin" && role !== "SuperAdmin") {
    return <Navigate to="/login" />;
  }

  return (
    <div className="h-screen flex flex-col fixed w-full">
      {/* Header at the top */}
      <Header toggleSidebar={() => setIsCollapsed(!isCollapsed)} role={role} />

      {/* Bottom part: Sidebar + Main Content */}
      <div className="flex flex-grow overflow-hidden">
        <div className="shrink-0">
          <Sidebar isCollapsed={isCollapsed} />
        </div>

        {/* Main content on the right */}
        <main className="flex-grow p-6 overflow-y-auto">
          <Outlet /> {/* Pages will load here */}
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
