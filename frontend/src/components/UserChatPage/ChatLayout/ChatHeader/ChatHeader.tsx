import { Flex, Avatar, Text } from "@chakra-ui/react";
import * as Types from "./ChatHeader.types";

const ChatHeader = ({ userDetails }: Types.IProps) => {
  return (
    <Flex w="100%">
      <Avatar
        size="lg"
        name={userDetails.username}
        src={"http://localhost:8000" + userDetails.image}
      />
      <Flex flexDirection="column" mx="5" justify="center">
        <Text fontSize="lg" fontWeight="bold">
          {userDetails.username}
        </Text>
        <Text color="green.500">Online</Text>
      </Flex>
    </Flex>
  );
};

export default ChatHeader;
