import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import * as Types from "./ChessGameChat.types";
import ChessGameChatFooter from "./ChessGameChatFooter";
import ChessGameChatMessages from "./ChessGameChatMessages";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { useEffect, useRef, useState } from "react";
import Functions from "../../../utils/Functions";
import { useSelector } from "react-redux";
import * as SharedTypes from "../../../shared/types";
import { RootState } from "../../../app/store";

const ChessGameChat = ({ gameId, enemyDetails }: Types.IProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const webSocketRef = useRef<W3CWebSocket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<SharedTypes.IMessagesData[]>([]);

  useEffect(() => {
    const connectWebSocket = () => {
      const clientWebSocket = new W3CWebSocket(
        "ws://localhost:8000/ws/game_chat/" +
          Functions.computeGameId(user?.id!, gameId!)
      );

      webSocketRef.current = clientWebSocket;

      clientWebSocket.onopen = () => {
        //createChessGame  TODO
        console.log("WebSocket Game chat - connected");
      };

      clientWebSocket.onerror = () => {};

      clientWebSocket.onmessage = (message) => {
        const dataFromServer = JSON.parse(message.data.toString());
        console.log("got reply! ");
        if (dataFromServer.type === "chat_message") {
          setMessages((prevState) => [
            ...prevState,
            {
              from: dataFromServer.sender === user?.id ? "me" : "computer",
              text: dataFromServer.message,
            },
          ]);
        }
      };
    };

    connectWebSocket();

    return () => {
      webSocketRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim().length) {
      return;
    }
    const data = inputMessage;
    try {
      webSocketRef.current?.send(
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
