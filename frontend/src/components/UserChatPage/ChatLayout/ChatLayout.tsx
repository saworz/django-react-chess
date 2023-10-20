import { useState } from "react";
import { Flex } from "@chakra-ui/react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatFooter from "./ChatFooter";
import * as Types from "./ChatLayout.types";

const ChatLayout = ({
  userDetails,
  messages,
  setMessages,
  clientWebSocket,
}: Types.IProps) => {
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim().length) {
      return;
    }
    const data = inputMessage;
    setMessages((old) => [...old, { from: "me", text: data }]);
    clientWebSocket.send(
      JSON.stringify({
        type: "chat_message",
        message: data,
      })
    );
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
