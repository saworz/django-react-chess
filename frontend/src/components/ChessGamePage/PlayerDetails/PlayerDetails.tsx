import { Flex, Box, Avatar, Text } from "@chakra-ui/react";
import * as SharedTypes from "../../../shared/types";

const PlayerDetails = ({
  image,
  username,
}: Pick<SharedTypes.IUserData, "image" | "username">) => {
  return (
    <Flex
      justifyContent={"space-between"}
      pl={5}
      pr={5}
      flex={1}
      direction="row"
      pt={3}
    >
      <Box display="flex">
        <Avatar
          name="Player-Black"
          src={image.startsWith("h") ? image : "http://localhost:8000" + image}
        />
        <Text pl={3}>{username}</Text>
      </Box>
      <Box>5:00</Box>
    </Flex>
  );
};

export default PlayerDetails;
