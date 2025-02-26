import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu as MenuIcon, Search, AccountCircle } from "@mui/icons-material";

const Header = ({ toggleSidebar }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate(); // navigation hook

  return (
    <header className="flex items-center justify-between bg-gray-800 text-white h-auto px-4 py-2">
      {/* Hamburger Icon */}
      <button onClick={toggleSidebar} className="text-white">
        <MenuIcon fontSize="large" />
      </button>

      {/* Search Bar */}
      <div className="relative w-1/3 hidden sm:block">
        <Search className="absolute m-1 text-gray-400" />
        <input
          type="text"
          className="w-full pl-8 pr-4 py-1 rounded bg-gray-700 text-white outline-none"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Profile Icon (Redirects to Edit Profile Page) */}
      <div className="cursor-pointer" onClick={() => navigate("/edit-profile")}>
        <AccountCircle fontSize="large" />
      </div>
    </header>
  );
};

export default Header;
