import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Redirect to login if no token is found
      navigate("/login");
      return;
    }

    // Fetch user dashboard data
    fetch("http://localhost:8000/api/auth/dashboard", {
      method: "GET",
      headers: {
        Authorization: token, // Send the token in the Authorization header
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Authentication failed");
        }
        return response.json();
      })
      .then((data) => {
        setUserData(data);
      })
      .catch(() => {
        // console.error("Error:", error);
        localStorage.removeItem("token"); // Remove invalid token
        navigate("/login"); // Redirect to login if token is invalid or expired
      });
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>
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
