import { useNavigate } from "react-router-dom";
import { Menu as MenuIcon, AccountCircle } from "@mui/icons-material";

const Header = ({ toggleSidebar, role }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (role === "Guide") {
      navigate("/guide/edit-profile");
    } else if (role === "Admin") {
      navigate("/edit-profile");
    } else if (role === "SuperAdmin") {
      navigate("/edit-profile");
    } else {
      navigate("/login"); // fallback
    }
  };

  return (
    <header className="flex items-center justify-between bg-gray-800 text-white h-auto px-4 py-2">
      {/* Hamburger Icon */}
      <button onClick={toggleSidebar} className="text-white">
        <MenuIcon fontSize="large" />
      </button>

      <div>
        <h3 className="text-2xl font-bold">Cylonian Travels</h3>
      </div>

      {/* Profile Icon (Redirects to Edit Profile Page) */}
      {/* Role + Profile Icon */}
      <div className="flex items-center gap-2">
        {role && (
          <span className="text-sm bg-gray-700 px-3 py-1 rounded-sm">
            {role}
          </span>
        )}
        <div className="cursor-pointer" onClick={handleProfileClick}>
          <AccountCircle fontSize="large" />
        </div>
      </div>
    </header>
  );
};

export default Header;
