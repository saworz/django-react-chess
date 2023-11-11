import * as Styles from "./Pieces.styles";
import * as Types from "./Pieces.types";
import Piece from "../Piece/Piece";
import Functions from "../../../utils/Functions";

const Pieces = ({ isGameStarted, piecesPositions }: Types.IProps) => {
  const position = new Array(8).fill("").map((x) => new Array(8).fill(""));
  Functions.fillPositionsPieces(position, piecesPositions.black_pieces);
  Functions.fillPositionsPieces(position, piecesPositions.white_pieces);

  return (
    <Styles.Pieces>
      {position.map((r, rank) =>
        r.map((f, file) =>
          position[rank][file] ? (
            <Piece
              key={rank + "-" + file}
              rank={rank}
              file={file}
              piece={position[rank][file]}
            />
          ) : null
        )
      )}
    </Styles.Pieces>
  );
};

export default Pieces;
