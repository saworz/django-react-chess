import * as Styles from "./Pieces.styles";
import Piece from "../Piece/Piece";

const Pieces = () => {
  const position = new Array(8).fill("").map((x) => new Array(8).fill(""));
  position[0][0] = "wr";
  position[0][7] = "wr";
  position[7][7] = "br";
  position[7][0] = "br";

  console.log(position);
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
