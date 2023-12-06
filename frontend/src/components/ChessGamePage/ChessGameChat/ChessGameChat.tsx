import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import * as Types from "./ChessGameChat.types";
import ChessGameChatFooter from "./ChessGameChatFooter";
import ChessGameChatMessages from "./ChessGameChatMessages";
import { useState } from "react";

const ChessGameChat = ({ webSocket, messages, enemyDetails }: Types.IProps) => {
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim().length) {
      return;
    }
    const data = inputMessage;
    try {
      webSocket?.send(
        JSON.stringify({
          data_type: "chat_message",
          message: data,
        })
      );
    } catch (error) {
      console.log(error);
    }
    setInputMessage("");
  };

  return (
    <Box
      rounded={"lg"}
      bg={useColorModeValue("white", "gray.700")}
      boxShadow={"lg"}
      p={2}
    >
      <Flex
        w="100%"
        h="189px"
        alignItems="start"
        justify="center"
        align="center"
      >
        <Flex w={["100%", "100%"]} h="90%" flexDir="column">
          <ChessGameChatMessages
            enemyDetails={enemyDetails}
            messages={messages}
          />
          <ChessGameChatFooter
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default ChessGameChat;
