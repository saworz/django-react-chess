import * as Types from "./Piece.types";
import * as Styles from "./Piece.styles";

const Piece = ({ file, piece, rank }: Types.IProps) => {
  return <Styles.Piece $piece={piece} $file={file} $rank={rank} />;
};

export default Piece;
