import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import LoginPage from "../../pages/LoginPage";
import RegisterPage from "../../pages/RegisterPage";
import DashboardPage from "../../pages/DashboardPage";
import FriendsPage from "../../pages/FriendsPage";
import AccountPage from "../../pages/AccountPage";
import ErrorPage from "../../pages/ErrorPage";
import UserDetailsPage from "../../pages/UserDetailsPage";
import UserChatPage from "../../pages/UserChatPage";
import PrivateRoutes from "../../utils/PrivateRoutes";
import PublicRoutes from "../../utils/PublicRoutes";
import Navigation from "../../components/Navigation";
import TokenService from "../../app/tokenService";

const RouterProvider = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Router>
      {TokenService.isUserLogged() && user ? <Navigation /> : null}
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/dashboard" element={<DashboardPage />}></Route>
          <Route path="/friends" element={<FriendsPage />}></Route>
          <Route path="/account" element={<AccountPage />}></Route>
          <Route
            path="/user_details/:userId/chat"
            element={<UserChatPage />}
          ></Route>
          <Route path="*" element={<ErrorPage />}></Route>
          <Route
            path="/user_details/:userId"
            element={<UserDetailsPage />}
          ></Route>
        </Route>
        <Route element={<PublicRoutes />}>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/register" element={<RegisterPage />}></Route>
          <Route path="*" element={<ErrorPage />}></Route>
        </Route>
      </Routes>
    </Router>
  );
};
export default RouterProvider;
