// import { Outlet } from "react-router-dom";
// import { useState } from "react";
// import Header from "../components/Header";
// import Sidebar from "../components/Sidebar";

// const BaseLayout = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   return (
//     <div className="h-screen flex flex-col fixed w-full">
//       {/* Header at the top */}
//       <Header toggleSidebar={() => setIsCollapsed(!isCollapsed)} />

//       {/* Bottom part: Sidebar + Main Content */}
//       <div className="flex flex-grow overflow-hidden">
//         <Sidebar isCollapsed={isCollapsed} />

//         {/* Main content on the right */}
//         <main className="flex-grow p-6 overflow-y-auto">
//           <Outlet /> {/* Pages will load here */}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default BaseLayout;


import React, { useState} from 'react'
import { Box, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
// import Sidebar from "components/Sidebar";
// import { useGetUserQuery } from "state/api";

const BaseLayout = () => {
  return (
    <Box width="100%" height="100%">
    <Box>
      <Navbar />
      <Outlet />
    </Box>
  </Box>
  )
};

export default BaseLayout;
