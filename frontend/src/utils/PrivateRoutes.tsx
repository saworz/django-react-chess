import { Outlet, Navigate } from "react-router-dom";
import TokenService from "../app/tokenService";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

const PrivateRoutes = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return TokenService.isUserLogged() && user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoutes;
