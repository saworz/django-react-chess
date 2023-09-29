import TokenService from "../../app/tokenService";
import { IRegisterUserData, ILoginUserData } from "../../shared/types";
import axios from "axios";

const API_URL = "http://localhost:8000/api/users/";

//Register user
const register = async (userData: IRegisterUserData) => {
  const response = await axios.post(API_URL + "register/", userData);

  return response.data;
};

//Login user
const login = async (userData: ILoginUserData) => {
  const response = await axios.post(API_URL + "login/", userData, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  });

  return response.data;
};

// Logout user
const logout = async () => {
  const config = {
    withCredentials: true,
    headers: {
      "x-csrftoken": TokenService.getCsrfToken(),
    },
  };
  const response = await axios.post(API_URL + "logout/", null, config);
  return response.data;
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
