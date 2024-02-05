import { useEffect, useRef } from "react";
import { Avatar, Flex, Text } from "@chakra-ui/react";
import * as Types from "./ChatMessages.types";

const ChatMessages = ({ messages, userDetails }: Types.IProps) => {
  const AlwaysScrollToBottom = () => {
    const elementRef = useRef<null | HTMLDivElement>(null);
    useEffect(() => elementRef.current?.scrollIntoView());
    return <div ref={elementRef} />;
  };

  return (
    <Flex
      w="100%"
      h="60vh"
      overflowY="scroll"
      flexDirection="column"
      p="3"
      pl={0}
    >
      {messages.map((item: any, index: number) => {
        if (item.from === "me") {
          return (
            <Flex key={index} w="100%" justifyContent="flex-end" mb={2}>
              <Flex
                bg="black"
                color="white"
                w="-webkit-fit-content"
                maxW="350px"
                maxH="30px"
                alignItems="center"
                justifyContent="flex-end"
                borderRadius="20px"
                p="3"
              >
                <Text>{item.text}</Text>
              </Flex>
            </Flex>
          );
        } else {
          return (
            <Flex key={index} w="100%" alignItems="center" marginBottom={2}>
              <Avatar
                name="Computer"
                src={"http://localhost:8000" + userDetails.image}
                bg="blue.300"
              ></Avatar>
              <Flex
                bg="gray.100"
                color="black"
                maxW="350px"
                maxH="30px"
                w="-webkit-fit-content"
                alignItems="center"
                borderRadius="20px"
                p="3"
                ml={2}
              >
                <Text>{item.text}</Text>
              </Flex>
            </Flex>
          );
        }
      })}
      <AlwaysScrollToBottom />
    </Flex>
  );
};

export default ChatMessages;
