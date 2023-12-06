import { Flex, Text } from "@chakra-ui/react";
import * as Types from "./ChessGameChatMessages.types";

const ChessGameChatMessages = ({ messages, enemyDetails }: Types.IProps) => {
  return (
    <Flex w="100%" h="60vh" overflowY="scroll" flexDirection="column" p="3">
      {messages.map((item: any, index: number) => {
        if (item.from === "me") {
          return (
            <Flex key={index} w="100%" direction="column" alignItems="flex-end">
              <Text>You:</Text>
              <Flex
                bg="black"
                color="white"
                minW="100px"
                maxW="150px"
                my="1"
                p="2"
              >
                <Text>{item.text}</Text>
              </Flex>
            </Flex>
          );
        } else {
          return (
            <Flex key={index} w="100%" direction="column">
              <Text>{enemyDetails.username}:</Text>
              <Flex
                bg="gray.100"
                color="black"
                minW="100px"
                maxW="150px"
                my="1"
                p="2"
              >
                <Text>{item.text}</Text>
              </Flex>
            </Flex>
          );
        }
      })}
    </Flex>
  );
};

export default ChessGameChatMessages;
