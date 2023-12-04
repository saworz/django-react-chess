import { Flex, Text } from "@chakra-ui/react";
import ChessBoard from "../../components/ChessGamePage/ChessBoard";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import Functions from "../../utils/Functions";
import {
  updatePositions,
  createChessGame,
} from "../../features/chess/chessSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";

const ChessGamePage = () => {
  const { gameId } = useParams();
  const [webSocket, setWebSocket] = useState<W3CWebSocket>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { chess } = useSelector((state: RootState) => state.chess);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    let clientWebSocket = new W3CWebSocket(
      "ws://localhost:8000/ws/chess/" +
        Functions.computeGameId(user?.id!, gameId!)
    );

    clientWebSocket.onopen = () => {
      //createChessGame i prepareChessGame TODO
      console.log("WebSocket connected");
      dispatch(
        createChessGame({
          gameRoomId: Number(Functions.computeGameId(user?.id!, gameId!)),
          isGameStarted: true,
        })
      );

      try {
        clientWebSocket?.send(
          JSON.stringify({
            data_type: "init_board",
          })
        );
        console.log("Init Board");
      } catch (error) {
        console.log("Socket error:", error);
      }
    };

    clientWebSocket.onerror = () => {
      const { gameRoomId, isGameStarted } = Functions.prepareChessGame(gameId!);
      dispatch(createChessGame({ gameRoomId, isGameStarted }));
      console.log("Websoket Error");
    };

    clientWebSocket.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data.toString());
      console.log("got reply! ");
      if (dataFromServer.data_type === "send_error") {
      } else if (dataFromServer.data_type === "move") {
        dispatch(
          updatePositions({
            white_pieces: Functions.mapPiecesToArray(
              dataFromServer.white_pieces
            ),
            black_pieces: Functions.mapPiecesToArray(
              dataFromServer.black_pieces
            ),
            black_checkmated: dataFromServer.black_checkmated,
            black_checked: dataFromServer.black_checked,
            white_checked: dataFromServer.white_checked,
            white_checkmated: dataFromServer.white_checkmated,
            current_player: dataFromServer.current_player,
          })
        );
      }
    };

    setWebSocket(clientWebSocket);

    return () => {
      clientWebSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isGameReady =
    chess.gameRoomId && webSocket && chess.piecesPosition ? true : false;
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
      {isGameReady && <ChessBoard webSocket={webSocket!} />}
    </Flex>
  );
};

export default ChessGamePage;
