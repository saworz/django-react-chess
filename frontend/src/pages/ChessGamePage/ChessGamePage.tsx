import { Flex, Text } from "@chakra-ui/react";
import ChessBoard from "../../components/ChessGamePage/ChessBoard";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import Functions from "../../utils/Functions";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import * as SharedTypes from "../../shared/types";

const ChessGamePage = () => {
  const { gameId } = useParams();
  const [gameRoomId, setGameRoomId] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [webSocket, setWebSocket] = useState<W3CWebSocket>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [piecesPositions, setPiecesPositions] =
    useState<SharedTypes.IPiecesPositions>();

  useEffect(() => {
    let clientWebSocket = new W3CWebSocket(
      "ws://localhost:8000/ws/chess/" +
        Functions.computeGameId(user?.id!, gameId!)
    );

    clientWebSocket.onopen = () => {
      console.log("WebSocket connected");
      setGameRoomId(Number(Functions.computeGameId(user?.id!, gameId!)));

      try {
        clientWebSocket?.send(
          JSON.stringify({
            data_type: "init_board",
          })
        );
        console.log("INIT");
      } catch (error) {
        console.log("Socket error:", error);
      }
    };

    clientWebSocket.onerror = () => {
      Functions.prepareChessGame(gameId!, setGameRoomId, setIsGameStarted);
    };

    clientWebSocket.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data.toString());
      console.log("got reply! ");
      if (dataFromServer) {
        setPiecesPositions(dataFromServer);
      }
    };

    setWebSocket(clientWebSocket);

    return () => {
      clientWebSocket.close();
    };
  }, []);

  const isGameReady = gameRoomId && webSocket && piecesPositions ? true : false;
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
      {isGameReady && (
        <ChessBoard
          piecesPositions={piecesPositions!}
          gameRoomId={gameRoomId}
          isGameStarted={isGameStarted}
        />
      )}
    </Flex>
  );
};

export default ChessGamePage;
