import { Flex, Box, Avatar, Text } from "@chakra-ui/react";
import * as Types from "./PlayerDetails.types";
import * as Styles from "./PlayerDetails.styles";
import _ from "lodash";

const PlayerDetails = ({ image, username, playerDetails }: Types.IProps) => {
  return (
    <Flex
      justifyContent={"space-between"}
      pl={5}
      pr={5}
      flex={1}
      direction="row"
      pt={2}
    >
      <Box display="flex">
        <Avatar
          size="md"
          name={username + "-avatar"}
          src={image.startsWith("h") ? image : "http://localhost:8000" + image}
        />
        <Box>
          <Text pl={3}>{username}</Text>
          <Box display="flex" pl={1} alignItems="center">
            {_.uniq(playerDetails.piecesCaptured).map((item) => (
              <Styles.Piece $piece={item} />
            ))}
            {playerDetails.points ? `+${playerDetails.points}` : null}
          </Box>
        </Box>
      </Box>
      <Box></Box>
    </Flex>
  );
};

export default PlayerDetails;
