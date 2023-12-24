import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  updateGame,
  createChessGame,
  initGame,
} from "../../features/chess/chessSlice";
import ChessBoard from "../../components/ChessGamePage/ChessBoard";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import Functions from "../../utils/Functions";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import HttpService from "../../utils/HttpService";
import ChessGameChat from "../../components/ChessGamePage/ChessGameChat";
import * as SharedTypes from "../../shared/types";

const ChessGamePage = () => {
  const { gameId } = useParams();
  const [webSocket, setWebSocket] = useState<W3CWebSocket>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { chess } = useSelector((state: RootState) => state.chess);
  const [messages, setMessages] = useState<SharedTypes.IMessagesData[]>([]);
  const [isUserFound, setIsUserFound] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const [enemyDetails, setEnemyDetails] =
    useState<SharedTypes.ISuggestionFriendData>();

  useEffect(() => {
    HttpService.getUserDetails(Number(gameId)).then((response) => {
      if (response?.status === 200) {
        setIsUserFound(true);
        setEnemyDetails(response.data);
      } else {
        setIsUserFound(false);
      }
    });

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
      if (dataFromServer.type === "error") {
      } else if (dataFromServer.type === "move") {
        dispatch(
          updateGame({
            black_checkmated: dataFromServer.black_checkmated,
            black_checked: dataFromServer.black_checked,
            black_en_passant_field: dataFromServer.black_en_passant_field,
            black_en_passant_pawn_to_capture:
              dataFromServer.black_en_passant_pawn_to_capture,
            black_long_castle_legal: dataFromServer.black_long_castle_legal,
            black_short_castle_legal: dataFromServer.black_short_castle_legal,
            white_checked: dataFromServer.white_checked,
            white_checkmated: dataFromServer.white_checkmated,
            white_en_passant_field: dataFromServer.white_en_passant_field,
            white_en_passant_pawn_to_capture:
              dataFromServer.white_en_passant_pawn_to_capture,
            white_long_castle_legal: dataFromServer.white_long_castle_legal,
            white_short_castle_legal: dataFromServer.white_short_castle_legal,
            current_player: dataFromServer.current_player,
            black_pieces: Functions.mapPiecesToArray(
              dataFromServer.black_pieces
            ),
            white_pieces: Functions.mapPiecesToArray(
              dataFromServer.white_pieces
            ),
          })
        );
      } else if (dataFromServer.type === "init") {
        dispatch(
          initGame({
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
            copy_white_pieces: Functions.mapPiecesToArray(
              dataFromServer.white_pieces
            ),
            copy_black_pieces: Functions.mapPiecesToArray(
              dataFromServer.black_pieces
            ),
          })
        );
      } else if (dataFromServer.type === "chat_message") {
        setMessages((prevState) => [
          ...prevState,
          {
            from: dataFromServer.sender === user?.id ? "me" : "computer",
            text: dataFromServer.message,
          },
        ]);
      }
    };

    setWebSocket(clientWebSocket);

    return () => {
      clientWebSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isGameReady =
    chess.gameRoomId && webSocket && chess.piecesPosition && isUserFound
      ? true
      : false;
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
      <Grid templateColumns={{ base: "1fr", "3lg": "1fr 1fr" }}>
        <GridItem>
          {isGameReady && <ChessBoard webSocket={webSocket!} />}
        </GridItem>
        <GridItem marginLeft={2} marginTop={{ base: 2, "3lg": 0 }}>
          <Grid templateRows={"5fr 2fr"} gap={3}>
            <GridItem>
              <Box
                rounded={"lg"}
                bg={useColorModeValue("white", "gray.700")}
                boxShadow={"lg"}
                p={4}
                height="100%"
                alignItems="center"
                display="flex"
                justifyContent="center"
              >
                <Text textAlign="center" fontSize={"4rem"} fontWeight="black">
                  Coming soon...
                </Text>
              </Box>
            </GridItem>
            <GridItem>
              {isGameReady && (
                <ChessGameChat
                  enemyDetails={enemyDetails!}
                  messages={messages}
                  webSocket={webSocket!}
                />
              )}
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    </Flex>
  );
};

export default ChessGamePage;
