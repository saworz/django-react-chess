import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import LoginPage from "../../pages/LoginPage";
import RegisterPage from "../../pages/RegisterPage";
import DashboardPage from "../../pages/DashboardPage";
import PrivateRoutes from "../../utils/PrivateRoutes";
import PublicRoutes from "../../utils/PublicRoutes";

const RouterProvider = () => {
  return (
    <Router>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/dashboard" element={<DashboardPage />}></Route>
        </Route>
        <Route element={<PublicRoutes />}>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/register" element={<RegisterPage />}></Route>
        </Route>
      </Routes>
    </Router>
  );
};
export default RouterProvider;
