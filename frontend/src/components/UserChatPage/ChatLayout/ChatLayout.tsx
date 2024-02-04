import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatFooter from "./ChatFooter";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import * as Types from "./ChatLayout.types";
import * as SharedTypes from "../../../shared/types";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import HttpService from "../../../utils/HttpService";

const ChatLayout = ({ userDetails, chatRoomId }: Types.IProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<SharedTypes.IMessagesData[]>([]);
  const [webSocket, setWebSocket] = useState<W3CWebSocket>();

  const getPreviousMessages = async () => {
    HttpService.getPreviousMessages(Number(chatRoomId)).then((response) => {
      if (response?.status === 200) {
        const formatedData = response.data
          .map(
            (message: {
              sender: number;
              message: string;
              timestamp: Date;
            }) => ({
              from: message.sender === user?.id ? "me" : "computer",
              text: message.message,
              timestamp: new Date(message.timestamp),
            })
          )
          .sort(
            (a: { timestamp: Date }, b: { timestamp: Date }) =>
              a.timestamp.getTime() - b.timestamp.getTime()
          );
        setMessages((prevState) => [...prevState, ...formatedData]);
      } else {
      }
    });
  };

  useEffect(() => {
    getPreviousMessages();
    const clientWebSocket = new W3CWebSocket(
      "ws://localhost:8000/ws/private_chat/" + chatRoomId
    );

    clientWebSocket.onopen = () => {
      console.log("WebSocket connected");
      console.log(chatRoomId);
    };

    clientWebSocket.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data.toString());
      console.log("got reply! ", dataFromServer);
      if (dataFromServer) {
        setMessages((prevState) => [
          ...prevState,
          {
            from: dataFromServer.sender === user?.id ? "me" : "computer",
            text: dataFromServer.message,
          },
        ]);
      }
    };

    setWebSocket(clientWebSocket);

    return () => {
      clientWebSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim().length) {
      return;
    }
    const data = inputMessage;
    try {
      webSocket?.send(
        JSON.stringify({
          type: "chat_message",
          message: data,
        })
      );
    } catch (error) {
      console.log(error);
    }
    setInputMessage("");
  };

  return (
    <Flex
      w="100%"
      h="-webkit-fit-content"
      alignItems="start"
      justify="center"
      align="center"
    >
      <Flex w={["100%", "100%"]} h="90%" flexDir="column">
        <ChatHeader userDetails={userDetails} />
        <ChatMessages messages={messages} userDetails={userDetails} />
        <ChatFooter
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
        />
      </Flex>
    </Flex>
  );
};

export default ChatLayout;
