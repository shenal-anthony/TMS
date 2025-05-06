import { NavLink } from "react-router-dom";
import {
  Dashboard,
  DirectionsCar,
  BarChart,
  ExitToApp,
} from "@mui/icons-material";
import RateReviewIcon from "@mui/icons-material/RateReview";
import HikingIcon from "@mui/icons-material/Hiking";

const GuideSidebar = ({ isCollapsed }) => {
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
            to="/guide-dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                isActive ? "bg-gray-700" : ""
              }`
            }
          >
            <Dashboard /> {!isCollapsed && "Dashboard"}
          </NavLink>
        </li>

        {/* Tours */}
        <li>
          <NavLink
            to="/Tours"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                isActive ? "bg-gray-700" : ""
              }`
            }
          >
            <HikingIcon /> {!isCollapsed && "Tours"}
          </NavLink>
        </li>

        {/* Feedbacks */}
        <li>
          <NavLink
            to="/Feedbacks"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                isActive ? "bg-gray-700" : ""
              }`
            }
          >
            <RateReviewIcon /> {!isCollapsed && "Feedbacks"}
          </NavLink>
        </li>

        {/* Vehicles */}
        <li>
          <NavLink
            to="/your-vehicles"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 hover:bg-gray-700 ${
                isActive ? "bg-gray-700" : ""
              }`
            }
          >
            <DirectionsCar /> {!isCollapsed && "Your Vehicles"}
          </NavLink>
        </li>

        {/* Reports */}
        <li>
          <NavLink
            to="/guide-reports"
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

export default GuideSidebar;
