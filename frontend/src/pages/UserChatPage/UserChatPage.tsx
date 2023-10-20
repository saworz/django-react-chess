import { Flex, Text, Stack, useColorModeValue, Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HttpService from "../../utils/HttpService";
import ChatLayout from "../../components/UserChatPage/ChatLayout";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import * as SharedTypes from "../../shared/types";

const UserChatPage = () => {
  const { userId } = useParams();
  const [chatRoomId, setChatRoomId] = useState(0);
  const [messages, setMessages] = useState<SharedTypes.IMessagesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] =
    useState<SharedTypes.ISuggestionFriendData>();

  const [clientWebSocket] = useState(
    new W3CWebSocket("ws://localhost:8000/ws/chat/" + chatRoomId)
  );

  useEffect(() => {
    clientWebSocket.onopen = () => {
      console.log("WebSocket connected");
    };

    clientWebSocket.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data.toString());
      console.log("TEST", message);
      console.log("got reply! ", dataFromServer.type);
      if (dataFromServer) {
        setMessages((prevState) => [
          ...prevState,
          {
            from: dataFromServer.type === "chat" ? "computer" : "me",
            text: dataFromServer.message,
          },
        ]);
      }
    };

    return () => {
      clientWebSocket.close();
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    HttpService.getChatRoomId(Number(userId))
      .then((response) => {
        if (response?.status === 200) {
          setChatRoomId(response.data.room_id);
        } else {
        }
      })
      .then(() => {
        HttpService.getUserDetails(Number(userId)).then((response) => {
          if (response?.status === 200) {
            setIsLoading(false);
            setUserDetails(response.data);
          } else {
            //setIsUserFound(false);
          }
        });
      })
      .catch((error) => {
        console.log("Błąd", error);
      });
  }, []);

  return (
    <Flex alignItems={"center"} flex={1} direction="column">
      <Stack w={{ base: "100%", "3md": "50%" }} alignItems={"center"}>
        <Text
          marginLeft="3"
          fontSize={"2rem"}
          fontWeight="black"
          alignSelf="flex-start"
        >
          Chat
        </Text>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={4}
          h="-webkit-fit-content"
        >
          {userDetails && chatRoomId && clientWebSocket && (
            <ChatLayout
              clientWebSocket={clientWebSocket}
              messages={messages}
              setMessages={setMessages}
              userDetails={userDetails}
            />
          )}
        </Box>
      </Stack>
    </Flex>
  );
};

export default UserChatPage;
