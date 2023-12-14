import Ranks from "./Ranks";
import Files from "./Files";
import Pieces from "../Pieces";
import * as Styles from "./ChessBoard.styles";
import * as Types from "./ChessBoard.types";
import { getKingPosition } from "../../../arbiter/getMoves";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import SoundPlayer from "../SoundPlayer";

const ChessBoard = ({ webSocket }: Types.IProps) => {
  const { chess } = useSelector((state: RootState) => state.chess);
  const { candidateMoves, chessBoard } = chess;
  let soundComponent = null;

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
          format="mp3"
          autoplay={false}
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
        pr={6}
        pt={6}
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
          <Files files={files} />
        </Styles.BoardContainer>
      </Box>
      {soundComponent}
    </>
  );
};

export default ChessBoard;
