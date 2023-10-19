import { Flex, Text, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HttpService from "../../utils/HttpService";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import ChatLayout from "../../components/UserChatPage/ChatLayout";
import * as SharedTypes from "../../shared/types";

const UserChatPage = () => {
  const { userId } = useParams();
  const [chatRoomId, setChatRoomId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] =
    useState<SharedTypes.ISuggestionFriendData>();
  let clientWebSocket: W3CWebSocket;

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
        console.log("Błądod", error);
      });
  }, []);

  clientWebSocket = new W3CWebSocket(
    "ws://localhost:8000/ws/chat/" + chatRoomId
  );

  useEffect(() => {
    clientWebSocket.onopen = () => {
      console.log("WebSocket connected");
    };
  }, [clientWebSocket]);

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
        {userDetails && <ChatLayout userDetails={userDetails} />}
      </Stack>
    </Flex>
  );
};

export default UserChatPage;
