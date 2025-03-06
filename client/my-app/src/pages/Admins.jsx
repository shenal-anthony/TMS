import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/admins')
      .then((response) => {
        // Ensure response.data is an array
        if (Array.isArray(response.data)) {
          setAdmins(response.data);  
        } else {
          setError('Response data is not an array');
        }
        setLoading(false);
      })
      .catch((error) => {
        setError('Error fetching admins: ' + error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;  
  if (error) return <div>{error}</div>;  

  return (
    <div>
      <h1>Admins List</h1>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {admins.length === 0 ? (
            <tr>
              <td colSpan="4">No admins found.</td>
            </tr>
          ) : (
            admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.id}</td>
                <td>{admin.name}</td>
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
