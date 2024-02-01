import { Flex, Grid, GridItem } from "@chakra-ui/react";
import {
  updateGame,
  createChessGame,
  initGame,
  getGameRoomDetails,
} from "../../features/chess/chessSlice";
import ChessBoard from "../../components/ChessGamePage/ChessBoard";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import Functions from "../../utils/Functions";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import HttpService from "../../utils/HttpService";
import ChessGameChat from "../../components/ChessGamePage/ChessGameChat";
import LoadingScreen from "../../components/ChessGamePage/LoadingScreen";
import GameDetailsWindow from "../../components/ChessGamePage/GameDetailsWindow";
import PlayerDetails from "../../components/ChessGamePage/PlayerDetails";
import * as SharedTypes from "../../shared/types";

const ChessGamePage = () => {
  const { gameId } = useParams();
  const [webSocket, setWebSocket] = useState<W3CWebSocket>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { chess } = useSelector((state: RootState) => state.chess);
  const [messages, setMessages] = useState<SharedTypes.IMessagesData[]>([]);
  const [isUserFound, setIsUserFound] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const webSocketRef = useRef<W3CWebSocket | null>(null);
  const reconnectCounter = useRef(1);
  const [enemyDetails, setEnemyDetails] =
    useState<SharedTypes.ISuggestionFriendData>();
  const isGameReady =
    chess.gameRoomId &&
    webSocket &&
    chess.piecesPosition &&
    isUserFound &&
    chess.gameDetails &&
    enemyDetails &&
    chess.isGameStarted &&
    user!.id
      ? true
      : false;
  const whitePlayerId = chess.gameDetails!.player_white!;
  const blackPlayerId = chess.gameDetails!.player_black!;

  const getPlayerPoints = (
    playerColor: string
  ): { piecesCaptured: string[]; points: number | null } => {
    const whitePoints = chess.gameDetails.white_score;
    const blackPoints = chess.gameDetails.black_score;

    if (playerColor === "white") {
      let piecesCaptured = [...chess.gameDetails.white_captures];
      if (piecesCaptured.length > 0) {
        for (let i = 0; i < piecesCaptured.length; i++) {
          if (typeof piecesCaptured[i] === "string") {
            piecesCaptured[i] = "b" + piecesCaptured[i];
          }
        }
      }
      return {
        piecesCaptured,
        points: whitePoints > blackPoints ? whitePoints - blackPoints : null,
      };
    } else {
      let piecesCaptured = [...chess.gameDetails.black_captures];
      if (piecesCaptured.length > 0) {
        for (let i = 0; i < piecesCaptured.length; i++) {
          if (typeof piecesCaptured[i] === "string") {
            piecesCaptured[i] = "w" + piecesCaptured[i];
          }
        }
      }
      return {
        piecesCaptured,
        points: blackPoints > whitePoints ? blackPoints - whitePoints : null,
      };
    }
  };

  useEffect(() => {
    HttpService.getUserDetails(Number(gameId)).then((response) => {
      if (response?.status === 200) {
        setIsUserFound(true);
        setEnemyDetails(response.data);
      } else {
        setIsUserFound(false);
      }
    });

    const connectWebSocket = () => {
      const clientWebSocket = new W3CWebSocket(
        "ws://localhost:8000/ws/chess/" +
          Functions.computeGameId(user?.id!, gameId!)
      );

      webSocketRef.current = clientWebSocket;

      clientWebSocket.onopen = () => {
        //createChessGame  TODO
        console.log("WebSocket connected");
        dispatch(getGameRoomDetails(gameId!));
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
        if (reconnectCounter.current < 3) {
          connectWebSocket();
          reconnectCounter.current += 1;
        } else {
          navigate("/notfound");
        }
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
              black_captured_pieces: dataFromServer.black_captured_pieces,
              black_score: dataFromServer.black_score,
              white_checked: dataFromServer.white_checked,
              white_checkmated: dataFromServer.white_checkmated,
              white_en_passant_field: dataFromServer.white_en_passant_field,
              white_en_passant_pawn_to_capture:
                dataFromServer.white_en_passant_pawn_to_capture,
              white_long_castle_legal: dataFromServer.white_long_castle_legal,
              white_short_castle_legal: dataFromServer.white_short_castle_legal,
              white_captured_pieces: dataFromServer.white_captured_pieces,
              white_score: dataFromServer.white_score,
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
        setWebSocket(clientWebSocket);
      };
    };

    connectWebSocket();

    return () => {
      webSocketRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isGameReady) {
    return <LoadingScreen />;
  }

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"flex-start"}
      flex={1}
      direction="column"
    >
      <Grid templateColumns={{ base: "1fr", "3lg": "1fr 1fr" }}>
        <GridItem>
          {isGameReady && (
            <PlayerDetails
              image={
                blackPlayerId === user!.id ? user!.image : enemyDetails!.image
              }
              username={
                blackPlayerId === user!.id
                  ? user!.username
                  : enemyDetails!.username
              }
              playerDetails={getPlayerPoints("black")}
            />
          )}
          {isGameReady && enemyDetails && (
            <ChessBoard enemyDetails={enemyDetails} webSocket={webSocket!} />
          )}
          {isGameReady && (
            <PlayerDetails
              image={
                whitePlayerId === user!.id ? user!.image : enemyDetails!.image
              }
              username={
                whitePlayerId === user!.id
                  ? user!.username
                  : enemyDetails!.username
              }
              playerDetails={getPlayerPoints("white")}
            />
          )}
        </GridItem>
        <GridItem marginLeft={2} marginTop={{ base: 2, "3lg": 0 }}>
          <Grid templateRows={"5fr 2fr"} gap={2} marginTop="64px">
            <GridItem>
              <GameDetailsWindow />
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
