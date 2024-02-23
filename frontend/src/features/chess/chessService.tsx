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

const getGameRoomDetails = async (data: {
  gameId: string;
  yourId: number | undefined;
}) => {
  const config = {
    withCredentials: true,
    headers: {
      "X-CSRFToken": TokenService.getCsrfToken(),
      "Content-Type": "application/json",
    },
  };

  const response = await axios.get(
    API_URL + `chess/get_room_id/${data.gameId}`,
    config
  );

  return { ...response.data, yourId: data.yourId };
};

const deleteGameRoom = async (roomId: string) => {
  const config = {
    withCredentials: true,
    headers: {
      "X-CSRFToken": TokenService.getCsrfToken(),
      "Content-Type": "application/json",
    },
  };

  const response = await axios.delete(
    API_URL + `chess/delete_room/${roomId}`,
    config
  );

  return response.data;
};

const chessService = {
  postCreateChessGame,
  getGameRoomDetails,
  deleteGameRoom,
};

export default chessService;
