import Ranks from "./Ranks";
import Files from "./Files";
import Pieces from "../Pieces";
import * as Styles from "./ChessBoard.styles";
import { Box, useColorModeValue } from "@chakra-ui/react";

const ChessBoard = () => {
  const ranks = Array(8)
    .fill("")
    .map((x, i) => 8 - i);

  const files = Array(8)
    .fill("")
    .map((x, i) => i + 1);

  return (
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
                return <Styles.LightTile key={file + "-" + rank} />;
              } else {
                return <Styles.DarkTile key={file + "-" + rank} />;
              }
            })
          )}
        </Styles.Tiles>
        <Pieces />
        <Files files={files} />
      </Styles.BoardContainer>
    </Box>
  );
};

export default ChessBoard;
