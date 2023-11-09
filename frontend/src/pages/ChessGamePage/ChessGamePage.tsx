import { Flex, Text } from "@chakra-ui/react";
import ChessBoard from "../../components/ChessGamePage/ChessBoard";
import { useParams } from "react-router-dom";
import HttpService from "../../utils/HttpService";
import Functions from "../../utils/Functions";
import { useEffect, useState } from "react";

const ChessGamePage = () => {
  const { gameId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [gameRoomId, setGameRoomId] = useState(0);
  const [isGameExists, setIsGameExists] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    HttpService.createChessGame(Number(gameId))
      .then((response) => {
        if (response?.status === 200) {
          setGameRoomId(response.data.room_id);
          setIsGameStarted(true);
        } else if (response?.status === 400) {
          setGameRoomId(Functions.getNumberFromText(response.data.message)!);
          setIsGameExists(true);
          setIsGameStarted(true);
        } else {
          throw new Error("Error during creating game");
        }
      })
      .then(() => {
        setIsGameStarted(true);
        console.log("SELO");
      })
      .catch((error) => {
        console.log(error.response.status);
        if (error.response.status === 400) {
          setGameRoomId(
            Functions.getNumberFromText(error.response.data.message)!
          );
          setIsGameExists(true);
          setIsGameStarted(true);
        } else {
          throw new Error("Error during creating game");
        }
      });
  }, []);

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"flex-start"}
      flex={1}
      direction="column"
    >
      <Text fontSize={"4rem"} fontWeight="black">
        Chess Game
      </Text>
      {isGameStarted && (
        <ChessBoard gameRoomId={gameRoomId} isGameStarted={isGameStarted} />
      )}
    </Flex>
  );
};

export default ChessGamePage;
