import TokenService from "../app/tokenService";
import { toast } from "react-toastify";
import axios from "axios";
import * as SharedTypes from "../shared/types";

const API_URL = "http://localhost:8000/api/";

const updateProfile = async (userData: FormData) => {
  try {
    const response = await axios.patch(
      API_URL + `users/update_user/`,
      userData,
      {
        withCredentials: true,
        headers: {
          "X-CSRFToken": TokenService.getCsrfToken(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response.status === 200) {
      toast.success(`Profile updated successfully`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return response.data;
    }
  } catch (error) {
    console.error(error);
  }
};

const updatePassword = async (
  passwordData: SharedTypes.IUpdatePasswordData
) => {
  try {
    const response = await axios.put(
      API_URL + `users/change_password/`,
      passwordData,
      {
        withCredentials: true,
        headers: {
          "X-CSRFToken": TokenService.getCsrfToken(),
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 200) {
      toast.success(`Password updated successfully`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  } catch (error: any) {
    const message = error.response.data.message;
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }
};

const getUserDetails = async (userId: number) => {
  try {
    const response = await axios.get(API_URL + `users/user_data/${userId}`, {
      withCredentials: true,
      headers: {
        "X-CSRFToken": TokenService.getCsrfToken(),
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error: any) {
    const message = error.response.data.message;
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }
};

const getPreviousMessages = async (chatRoomId: number) => {
  try {
    const response = await axios.get(
      API_URL + `chat/get_messages/${chatRoomId}/`,
      {
        withCredentials: true,
        headers: {
          "X-CSRFToken": TokenService.getCsrfToken(),
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error: any) {
    const message = error.response.data.message;
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }
};

const getChatRoomId = async (userId: number) => {
  try {
    const response = await axios.get(API_URL + `chat/get_room_id/${userId}`, {
      withCredentials: true,
      headers: {
        "X-CSRFToken": TokenService.getCsrfToken(),
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error: any) {
    const message = error.response.data.message;
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }
};

const HttpService = {
  updateProfile,
  updatePassword,
  getUserDetails,
  getChatRoomId,
  getPreviousMessages,
};

export default HttpService;
