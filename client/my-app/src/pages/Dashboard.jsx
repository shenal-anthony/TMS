// import { useEffect, useState } from "react";
// import { getUserData } from "../state/authService";

// const Dashboard = () => {
//   const [userName, setUserName] = useState("");

//   useEffect(() => {
//     const fetchUserName = async () => {
//       try {
//         const data = await getUserData();
//         setUserName(data.name); // Store the user's name
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };

//     fetchUserName();
//   }, []);

//   return (
//     <div>
//       <h1>Dashboard</h1>
//       <h2>Welcome, {userName ? userName : "User"}!</h2>
//     </div>
//   );
// };

// export default Dashboard;

import React from 'react'

const Dashboard = () => {
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard