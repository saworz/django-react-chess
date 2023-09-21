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
  const response = await axios.post(API_URL + "login/", userData);

  return response.data;
};

// Logout user
const logout = async () => {
  const response = await axios.post(API_URL + "logout/");
  return response.data;
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
