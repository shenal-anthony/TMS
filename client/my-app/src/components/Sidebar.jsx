import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Dashboard,
  People,
  DirectionsCar,
  BarChart,
  ExpandMore,
  ExpandLess,
  SupervisorAccount,
  LibraryBooks,
  FolderShared,
  ExitToApp,
  Book,
  ManageAccounts,
  PermMedia,
  ShowChart,
  Explore
} from "@mui/icons-material";

const Sidebar = ({ isCollapsed }) => {
  const [open, setOpen] = useState({
    bookings: false,
    vehicles: false,
  });

  return (
    <aside
      className={`bg-gray-900 text-white flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      } transition-all duration-300 h-full overflow-y-auto p-3`}
    >
      <ul className="flex-grow">
        {/* Dashboard */}
        <li>
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 p-2 hover:bg-gray-700"
          >
            <Dashboard /> {!isCollapsed && "Dashboard"}
          </NavLink>
        </li>

        {/* Bookings */}
        <li>
          <button
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700"
            onClick={() => setOpen({ ...open, bookings: !open.bookings })}
          >
            <div className="flex items-center gap-2">
              <Book /> {!isCollapsed && "Bookings"}
            </div>
            {!isCollapsed && (open.bookings ? <ExpandLess /> : <ExpandMore />)}
          </button>

          {open.bookings && (
            <ul className="ml-6">
              <li>
                <NavLink
                  to="/bookings/pending"
                  className="block p-2 hover:bg-gray-700"
                >
                  Pending Bookings
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/bookings/confirmed"
                  className="block p-2 hover:bg-gray-700"
                >
                  View Bookings
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Admins */}
        <li>
          <NavLink
            to="/admins"
            className="flex items-center gap-2 p-2 hover:bg-gray-700"
          >
            <SupervisorAccount /> {!isCollapsed && "Admins"}
          </NavLink>
        </li>

        {/* Contents */}
        <li>
          <NavLink
            to="/contents"
            className="flex items-center gap-2 p-2 hover:bg-gray-700"
          >
            <LibraryBooks /> {!isCollapsed && "Contents"}
          </NavLink>
        </li>

        {/* Guide & Availability */}
        <li>
          <NavLink
            to="/guide-availability"
            className="flex items-center gap-2 p-2 hover:bg-gray-700"
          >
            <Explore /> {!isCollapsed && "Guide & Availability"}
          </NavLink>
        </li>

        {/* Vehicles */}
        <li>
          <button
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700"
            onClick={() => setOpen({ ...open, vehicles: !open.vehicles })}
          >
            <div className="flex items-center gap-2">
              <DirectionsCar /> {!isCollapsed && "Vehicles"}
            </div>
            {!isCollapsed && (open.vehicles ? <ExpandLess /> : <ExpandMore />)}
          </button>

          {open.vehicles && (
            <ul className="ml-6">
              <li>
                <NavLink
                  to="/vehicles/your-vehicles"
                  className="block p-2 hover:bg-gray-700"
                >
                  Your Vehicles
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/vehicles/manage-vehicles"
                  className="block p-2 hover:bg-gray-700"
                >
                  Manage Vehicles
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Reports */}
        <li>
          <NavLink
            to="/reports"
            className="flex items-center gap-2 p-2 hover:bg-gray-700"
          >
            <BarChart /> {!isCollapsed && "Reports"}
          </NavLink>
        </li>
      </ul>

      {/* Logout at the bottom */}
      <div className="mt-auto">
        <NavLink
          to="/login"
          className="flex items-center gap-2 p-2 hover:bg-red-600"
        >
          <ExitToApp /> {!isCollapsed && "Logout"}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
