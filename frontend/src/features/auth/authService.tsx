import { IRegisterUserData, ILoginUserData } from "../../shared/types";
import axios from "axios";

const API_URL = "http://localhost:8000/api/users/";

//Register user
const register = async (userData: IRegisterUserData) => {
  const response = await axios.post(API_URL + "register/", userData);

  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

//Login user
const login = async (userData: ILoginUserData) => {
  const response = await axios.post(API_URL + "login/", userData);

  if (response.data && response.status === 200) {
    localStorage.setItem(
      "jwt_token",
      JSON.stringify(response.data.jwt_access_token)
    );
    localStorage.setItem(
      "jwt_refresh",
      JSON.stringify(response.data.jwt_refresh_token)
    );
  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("jwt_refresh");
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
