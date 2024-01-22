import { Flex, Text, Stack, useColorModeValue, Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HttpService from "../../utils/HttpService";
import ChatLayout from "../../components/UserChatPage/ChatLayout";
import * as SharedTypes from "../../shared/types";

const UserChatPage = () => {
  const { userId } = useParams();
  const [chatRoomId, setChatRoomId] = useState(0);
  const [, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] =
    useState<SharedTypes.ISuggestionFriendData>();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {userDetails && chatRoomId && (
            <ChatLayout userDetails={userDetails} chatRoomId={chatRoomId} />
          )}
        </Box>
      </Stack>
    </Flex>
  );
};

export default UserChatPage;
