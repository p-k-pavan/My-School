import React, { useEffect } from "react";
import Sidebar from "./SideBar";
import Header from "./Header";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();

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
        <Sidebar />
        <div className="min-h-screen w-full bg-muted lg:ml-64">
          <Header />
          <div className="h-full p-5">{children}</div>
        </div>
      </div>
    );
  }

  return children;
};

export default Layout;
