import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Redirect to login if no token is found
      navigate("/login");
      return;
    }

    // Fetch user dashboard data using axios
    axios
      .get(`${apiUrl}/api/auth/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the Authorization header
        },
      })
      .then((response) => {
        setUserData(response.data); // Set user data from the response
      })
      .catch((error) => {
        console.error("Error:", error);
        localStorage.removeItem("token"); // Remove invalid token
        navigate("/login"); // Redirect to login if token is invalid or expired
      });
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>
      {userData && (
        <div>
          <p>Welcome, {userData.name}!</p>
          <p>Email: {userData.email}</p>
        </div>
      )}
      <button
        className="btn"
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
