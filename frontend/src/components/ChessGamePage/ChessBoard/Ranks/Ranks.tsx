import * as Types from "./Ranks.types";
import * as Styles from "./Ranks.styles";
const Ranks = ({ ranks }: Types.Props) => {
  return (
    <Styles.Ranks>
      {ranks.map((rank) => (
        <span key={rank}>{rank}</span>
      ))}
    </Styles.Ranks>
  );
};

export default Ranks;
