import TokenService from "../app/tokenService";
import axios from "axios";
import * as SharedTypes from "../shared/types";

const API_URL = "http://localhost:8000/api/";

const updateProfile = async (userData: SharedTypes.IUpdateUserData) => {
  const response = await axios.put(API_URL + `users/update_user/`, userData, {
    withCredentials: true,
    headers: {
      "X-CSRFToken": TokenService.getCsrfToken(),
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

const HttpService = {
  updateProfile,
};

export default HttpService;
