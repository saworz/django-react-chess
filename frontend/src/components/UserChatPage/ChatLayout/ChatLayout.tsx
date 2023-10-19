import { useState } from "react";
import { Flex } from "@chakra-ui/react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import * as Types from "./ChatLayout.types";

const ChatLayout = ({ userDetails }: Types.IProps) => {
  const [inputMessage, setInputMessage] = useState("");

  const [messages, setMessages] = useState([
    { from: "computer", text: "Hi, My Name is HoneyChat" },
    { from: "me", text: "Hey there" },
    { from: "me", text: "Myself Ferin Patel" },
    {
      from: "computer",
      text: "Nice to meet you. You can send me message and i'll reply you with same message.",
    },
  ]);

  return (
    <Flex w="100%" h="100vh" justify="center" align="center">
      <Flex w={["100%", "100%", "40%"]} h="90%" flexDir="column">
        <ChatHeader userDetails={userDetails} />
        <ChatMessages messages={messages} userDetails={userDetails} />
      </Flex>
    </Flex>
  );
};

export default ChatLayout;
