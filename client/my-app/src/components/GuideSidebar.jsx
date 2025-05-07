import { NavLink, useNavigate } from "react-router-dom";
import {
  Dashboard,
  DirectionsCar,
  BarChart,
  ExitToApp,
} from "@mui/icons-material";
import RateReviewIcon from "@mui/icons-material/RateReview";
import HikingIcon from "@mui/icons-material/Hiking";

const GuideSidebar = ({ isCollapsed }) => {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <aside
      className={`bg-gray-900 text-white flex flex-col transition-all duration-300 h-full overflow-y-auto p-3 ${
        isCollapsed ? "w-16 min-w-[4rem]" : "w-64 min-w-[16rem]"
      } shrink-0`}
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

      {/* Logout Button */}
      <div className="mt-auto">
        <div
          onClick={logout}
          className="flex items-center gap-2 p-2 cursor-pointer hover:bg-red-600"
        >
          <ExitToApp /> {!isCollapsed && "Logout"}
        </div>
      </div>
    </aside>
  );
};

export default GuideSidebar;
