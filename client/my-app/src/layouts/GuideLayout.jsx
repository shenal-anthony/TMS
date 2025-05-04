import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const GuideLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col fixed w-full">
      {/* Header at the top */}
      {/* <Header toggleSidebar={() => setIsCollapsed(!isCollapsed)} /> */}

      {/* Bottom part: Sidebar + Main Content */}
      {/* <div className="flex flex-grow overflow-hidden">
        <Sidebar isCollapsed={isCollapsed} /> */}

        {/* Main content on the right */}
        <main className="flex-grow p-6 overflow-y-auto">
          <Outlet /> {/* Pages will load here */}
        </main>
      {/* </div> */}
    </div>
  );
};

export default GuideLayout;
