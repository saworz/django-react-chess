import Ranks from "./Ranks";
import Files from "./Files";
import Pieces from "../Pieces";
import * as Styles from "./ChessBoard.styles";
import * as Types from "./ChessBoard.types";
import { getKingPosition } from "../../../arbiter/getMoves";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import GameEndsPopup from "../GameEndsPopup";
import {
  deleteGameRoom,
  endGameByWin,
  updatePlayerScore,
} from "../../../features/chess/chessSlice";
import { openPopup } from "../../../features/popup/popupSlice";
import { useEffect } from "react";
import PromotionPopup from "../PromotionPopup";
import { Howl } from "howler";
import SoundPlayer from "../SoundPlayer";

const ChessBoard = ({ webSocket, enemyDetails }: Types.IProps) => {
  const { chess } = useSelector((state: RootState) => state.chess);
  const { popup } = useSelector((state: RootState) => state.popup);
  const { user } = useSelector((state: RootState) => state.auth);

  const dispatch: AppDispatch = useDispatch();
  const { candidateMoves, chessBoard } = chess;
  const checkedPlayer = chess.current_player[0];
  const blackPlayerName =
    chess.gameDetails.player_black === user?.id
      ? user.username
      : enemyDetails.username;
  const whitePlayerName =
    chess.gameDetails.player_white === user?.id
      ? user.username
      : enemyDetails.username;

  let soundComponent = null;

  useEffect(() => {
    if (chess.black_checkmated || chess.white_checkmated) {
      const sound = new Howl({
        src: "/sounds/game-end.mp3",
        format: "mp3",
        html5: true,
        autoplay: false,
      });
      sound.play();
      //TODO - FIX
      dispatch(
        endGameByWin({
          colorWinner: checkedPlayer,
          winner: checkedPlayer === "w" ? blackPlayerName : whitePlayerName,
        })
      );
      dispatch(openPopup());
      if (
        user?.id === chess.gameDetails.player_white &&
        chess.white_checkmated
      ) {
        dispatch(
          updatePlayerScore({
            whitePlayerPk: chess.gameDetails.player_white,
            blackPlayerPk: chess.gameDetails.player_black,
            gameOutcome: 1,
          })
        ).then(() => dispatch(deleteGameRoom(chess.gameRoomId)));
      }
      if (
        user?.id === chess.gameDetails.player_black &&
        chess.black_checkmated
      ) {
        dispatch(
          updatePlayerScore({
            whitePlayerPk: chess.gameDetails.player_white,
            blackPlayerPk: chess.gameDetails.player_black,
            gameOutcome: 2,
          })
        ).then(() => dispatch(deleteGameRoom(chess.gameRoomId)));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedPlayer]);

  const ranks = Array(8)
    .fill("")
    .map((x, i) => 8 - i);

  const files = Array(8)
    .fill("")
    .map((x, i) => i + 1);

  const isChecked = (() => {
    const checkedPlayer = chess.current_player[0];
    if (chess.black_checked || chess.white_checked) {
      soundComponent = (
        <SoundPlayer
          src="/sounds/move-check.mp3"
          autoplay={false}
          format="mp3"
        />
      );
      return getKingPosition(chess.piecesPosition, checkedPlayer);
    }
    return null;
  })();

  const getClassName = (i: number, j: number) => {
    let className = "";
    if (candidateMoves?.find((pos) => pos[0] === i && pos[1] === j)) {
      if (chessBoard[i][j]) {
        className += " attacking";
      } else {
        className += " highlight";
      }
    }

    if (isChecked && isChecked[0] - 1 === j && isChecked[1] - 1 === i) {
      className += " checked";
    }

    return className;
  };

  return (
    <>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={1}
        pr={5}
        pt={5}
        mt={2}
        h="-webkit-fit-content"
        w="-webkit-fit-content"
      >
        <Styles.BoardContainer>
          <Ranks ranks={ranks} />
          <Styles.Tiles>
            {ranks.map((rank, i) =>
              files.map((file, j) => {
                if ((i + j) % 2 === 0) {
                  return (
                    <Styles.LightTile
                      className={getClassName(7 - i, j)}
                      key={file + "-" + rank}
                    />
                  );
                } else {
                  return (
                    <Styles.DarkTile
                      className={getClassName(7 - i, j)}
                      key={file + "-" + rank}
                    />
                  );
                }
              })
            )}
          </Styles.Tiles>
          <Pieces webSocket={webSocket} />
          {popup.isOpen && <GameEndsPopup />}
          {popup.isOpen && <PromotionPopup webSocket={webSocket} />}
          <Files files={files} />
        </Styles.BoardContainer>
      </Box>
      {soundComponent}
    </>
  );
};

export default ChessBoard;
