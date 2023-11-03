import * as Types from "./Files.types";
import * as Styles from "./Files.styles";

const Files = ({ files }: Types.Files) => {
  return (
    <Styles.Files>
      {files.map((file) => (
        <span key={String.fromCharCode(file + 96)}>
          {String.fromCharCode(file + 96)}
        </span>
      ))}
    </Styles.Files>
  );
};

export default Files;
