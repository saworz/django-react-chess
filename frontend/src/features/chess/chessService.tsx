import axios from "axios";
import TokenService from "../../app/tokenService";

const API_URL = "http://localhost:8000/api/";

const postCreateChessGame = async (userId: string) => {
  const config = {
    withCredentials: true,
    headers: {
      "X-CSRFToken": TokenService.getCsrfToken(),
      "Content-Type": "application/json",
    },
  };

  const response = await axios.post(
    API_URL + `chess/new_game/${userId}`,
    null,
    config
  );

  return response.data;
};

const chessService = {
  postCreateChessGame,
};

export default chessService;
