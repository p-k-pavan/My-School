import React, { useState, useEffect } from "react";
import Sidebar from "./SideBar";
import Header from "./Header";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  if (
    location.pathname !== "/" &&
    location.pathname !== "/forgot-password" &&
    location.pathname !== "/reset-password"
  ) {
    return (
      <div className="flex bg-muted">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`min-h-screen w-full bg-muted transition-all duration-300 ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
          <Header onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />
          <div className="h-full p-5">{children}</div>
        </div>
      </div>
    );
  }

  return children;
};

export default Layout;
