import React, { useEffect, useState } from "react";
import axios from "axios";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    axios
      .get(`${apiUrl}/api/admins`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setAdmins(response.data);
        } else {
          setError("Response data is not an array");
        }
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching admins: " + error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const headers = ["ID", "Name", "Email", "Role"];

  return (
    <div>
      <h1>Admins List</h1>
      <table border="1" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Admin Data Rows */}
          {admins.length === 0 ? (
            <tr>
              <td colSpan="4">No admins found.</td>
            </tr>
          ) : (
            admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.id}</td>
                <td>{admin.first_name}</td>
                <td>{admin.email}</td>
                <td>{admin.role}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Admins;
