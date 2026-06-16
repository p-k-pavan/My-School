import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const RedirectIfAuthenticated = () => {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
export default RedirectIfAuthenticated;
