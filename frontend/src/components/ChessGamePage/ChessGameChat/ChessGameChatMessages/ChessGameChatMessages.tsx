import { Flex, Text } from "@chakra-ui/react";
import * as Types from "./ChessGameChatMessages.types";
import { useEffect, useRef, useState } from "react";

const ChessGameChatMessages = ({ messages, enemyDetails }: Types.IProps) => {
  const messagesList = useRef<HTMLDivElement>(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const scrollToBottom = () => {
    messagesList.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (screenWidth >= 1020) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
            <Flex key={index} w="100%" direction="column">
              <Text>{enemyDetails.username}:</Text>
              <Flex
                bg="gray.100"
                color="black"
                maxW="350px"
                maxH="30px"
                w="-webkit-fit-content"
                alignItems="center"
                borderRadius="20px"
                p="3"
              >
                <Text>{item.text}</Text>
              </Flex>
            </Flex>
          );
        }
      })}
      <div ref={messagesList}></div>
    </Flex>
  );
};

export default ChessGameChatMessages;
