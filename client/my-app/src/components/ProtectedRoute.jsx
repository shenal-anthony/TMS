import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ allowedRoles, onAuthSuccess }) => {
  const [isAllowed, setIsAllowed] = useState(null);

  useEffect(() => {
    const verify = async () => {
      const accessToken = sessionStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        setIsAllowed(false);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/check-role`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const { userId, role } = res.data;
        if (allowedRoles.includes(role)) {
          onAuthSuccess?.({ userId, role }); // 👈 call the callback
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      } catch (err) {
        sessionStorage.removeItem("accessToken");
        setIsAllowed(false);
      }
    };

    verify();
  }, []);

  if (isAllowed === null) return <p>Loading...</p>;
  return isAllowed ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
