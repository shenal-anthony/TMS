import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Dashboard,
  Book,
  SupervisorAccount,
  LibraryBooks,
  DirectionsCar,
  BarChart,
  Explore,
  ExitToApp,
  ExpandMore,
  ExpandLess,
  FiberManualRecord, // Icon for submenu items
} from "@mui/icons-material";

const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    bookings: false,
    contents: false,
    vehicles: false,
  });

  // Helper function to check if the current route is under a specific path
  const isRouteUnder = (path) => location.pathname.startsWith(path);

  // Toggle submenu open/closed
  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

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
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                isActive ? "bg-gray-700" : ""
              }`
            }
          >
            <Dashboard /> {!isCollapsed && "Dashboard"}
          </NavLink>
        </li>

        {/* Bookings */}
        <li>
          <div
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700 cursor-pointer"
            onClick={() => toggleMenu("bookings")} // Always allow toggling, even in collapsed mode
          >
            <div className="flex items-center gap-2">
              <Book /> {!isCollapsed && "Bookings"}
            </div>
            {!isCollapsed &&
              (openMenus.bookings || isRouteUnder("/bookings") ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              ))}
          </div>

          {/* Show submenu if:
              1. The menu is toggled open, OR
              2. The current route is under "/bookings"
          */}
          {(openMenus.bookings || isRouteUnder("/bookings")) && (
            <ul className={`${isCollapsed ? "ml-2" : "ml-6"}`}>
              <li>
                <NavLink
                  to="/bookings/pending"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                      isActive ? "bg-gray-700" : ""
                    }`
                  }
                >
                  <FiberManualRecord fontSize="small" />{" "}
                  {!isCollapsed && "Pending Bookings"}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/bookings/confirmed"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                      isActive ? "bg-gray-700" : ""
                    }`
                  }
                >
                  <FiberManualRecord fontSize="small" />{" "}
                  {!isCollapsed && "View Bookings"}
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Admins */}
        <li>
          <NavLink
            to="/admins"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                isActive ? "bg-gray-700" : ""
              }`
            }
          >
            <SupervisorAccount /> {!isCollapsed && "Admins"}
          </NavLink>
        </li>

        {/* Contents */}
        <li>
          <div
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700 cursor-pointer"
            onClick={() => toggleMenu("contents")} // Always allow toggling, even in collapsed mode
          >
            <div className="flex items-center gap-2">
              <LibraryBooks /> {!isCollapsed && "Contents"}
            </div>
            {!isCollapsed &&
              (openMenus.contents || isRouteUnder("/contents") ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              ))}
          </div>

          {/* Show submenu if:
              1. The menu is toggled open, OR
              2. The current route is under "/contents"
          */}
          {(openMenus.contents || isRouteUnder("/contents")) && (
            <ul className={`${isCollapsed ? "ml-2" : "ml-6"}`}>
              <li>
                <NavLink
                  to="/contents/destinations"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                      isActive ? "bg-gray-700" : ""
                    }`
                  }
                >
                  <FiberManualRecord fontSize="small" />{" "}
                  {!isCollapsed && "Destinations"}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contents/events"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                      isActive ? "bg-gray-700" : ""
                    }`
                  }
                >
                  <FiberManualRecord fontSize="small" />{" "}
                  {!isCollapsed && "Events"}
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Vehicles */}
        <li>
          <div
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700 cursor-pointer"
            onClick={() => toggleMenu("vehicles")} // Always allow toggling, even in collapsed mode
          >
            <div className="flex items-center gap-2">
              <DirectionsCar /> {!isCollapsed && "Vehicles"}
            </div>
            {!isCollapsed &&
              (openMenus.vehicles || isRouteUnder("/vehicles") ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              ))}
          </div>

          {/* Show submenu if:
              1. The menu is toggled open, OR
              2. The current route is under "/vehicles"
          */}
          {(openMenus.vehicles || isRouteUnder("/vehicles")) && (
            <ul className={`${isCollapsed ? "ml-2" : "ml-6"}`}>
              <li>
                <NavLink
                  to="/vehicles/your-vehicles"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                      isActive ? "bg-gray-700" : ""
                    }`
                  }
                >
                  <FiberManualRecord fontSize="small" />{" "}
                  {!isCollapsed && "Your Vehicles"}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/vehicles/manage-vehicles"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                      isActive ? "bg-gray-700" : ""
                    }`
                  }
                >
                  <FiberManualRecord fontSize="small" />{" "}
                  {!isCollapsed && "Manage Vehicles"}
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Reports */}
        <li>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                isActive ? "bg-gray-700" : ""
              }`
            }
          >
            <BarChart /> {!isCollapsed && "Reports"}
          </NavLink>
        </li>
      </ul>

      {/* Logout at the bottom */}
      <div className="mt-auto">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 hover:bg-red-600 ${
              isActive ? "bg-red-600" : ""
            }`
          }
        >
          <ExitToApp /> {!isCollapsed && "Logout"}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;