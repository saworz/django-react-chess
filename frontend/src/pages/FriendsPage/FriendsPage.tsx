import { Button, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import FriendsView from "../../components/FriendsPage/FriendsView";
import PendingRequestsView from "../../components/FriendsPage/PendingRequestsView";
import SentRequestsView from "../../components/FriendsPage/SentRequestsView";

const FriendsPage = () => {
  const [switchedView, setSwitchedView] = useState("friendList");

  const handleClick = (type: string) => {
    switch (type) {
      case "friendList":
        setSwitchedView("friendList");
        break;
      case "pendingRequests":
        setSwitchedView("pendingRequests");
        break;
      case "sentRequests":
        setSwitchedView("sentRequests");
        break;
      default:
        setSwitchedView("friendList");
        break;
    }
  };

  const renderView = () => {
    switch (switchedView) {
      case "friendList":
        return <FriendsView />;
      case "pendingRequests":
        return <PendingRequestsView />;
      case "sentRequests":
        return <SentRequestsView />;
      default:
        return <FriendsView />;
    }
  };

  const switchTitle = () => {
    switch (switchedView) {
      case "friendList":
        return "Friends";
      case "pendingRequests":
        return "Pending Requests";
      case "sentRequests":
        return "Sent Requests";
      default:
        return "Friends";
    }
  };

  return (
    <Flex alignItems={"center"} flex={1} direction="column">
      <Stack w={{ base: "100%", lg: "50%" }} alignItems={"center"}>
        <Text
          marginLeft="3"
          fontSize={"2rem"}
          fontWeight="black"
          alignSelf="flex-start"
        >
          {switchTitle()}
        </Text>
        <HStack
          as={"nav"}
          spacing={4}
          alignSelf="flex-start"
          marginLeft="3"
          display={{ base: "none", md: "flex" }}
        >
          <Button
            onClick={() => handleClick("friendList")}
            colorScheme={switchedView === "friendList" ? "facebook" : "gray"}
          >
            Friends List
          </Button>
          <Button
            onClick={() => handleClick("pendingRequests")}
            colorScheme={
              switchedView === "pendingRequests" ? "facebook" : "gray"
            }
          >
            Pending Requests
          </Button>
          <Button
            onClick={() => handleClick("sentRequests")}
            colorScheme={switchedView === "sentRequests" ? "facebook" : "gray"}
          >
            Sent Requests
          </Button>
        </HStack>
        {renderView()}
      </Stack>
    </Flex>
  );
};

export default FriendsPage;
