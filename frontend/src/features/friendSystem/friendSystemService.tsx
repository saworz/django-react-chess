import TokenService from "../../app/tokenService";
import axios from "axios";

const API_URL = "http://localhost:8000/api/";

//Get Suggestions List
const getSuggestionsList = async (searchInput: string) => {
  const response = await axios.get(
    API_URL + `users/list_profiles/${searchInput}/`,
    {
      headers: {
        Authorization: TokenService.getAccessToken(),
        "X-CSRFToken": TokenService.getCsrfToken(),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

//Get Friends List
const getFriendsList = async () => {
  const response = await axios.get(API_URL + "friends/get_friends_list/", {
    withCredentials: true,
    headers: {
      "x-csrftoken": TokenService.getCsrfToken(),
    },
  });

  return response.data;
};

//Get Pending Requests
const getPendingRequests = async () => {
  const response = await axios.get(API_URL + "friends/get_pending_requests/", {
    withCredentials: true,
    headers: {
      "x-csrftoken": TokenService.getCsrfToken(),
    },
  });

  return response.data;
};

//Get Sent Requests
const getSentRequests = async () => {
  const response = await axios.get(API_URL + "friends/get_sent_requests/", {
    withCredentials: true,
    headers: {
      "x-csrftoken": TokenService.getCsrfToken(),
    },
  });

  return response.data;
};

const friendSystemService = {
  getFriendsList,
  getSuggestionsList,
  getPendingRequests,
  getSentRequests,
};

export default friendSystemService;
