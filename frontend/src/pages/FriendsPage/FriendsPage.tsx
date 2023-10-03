import { Button, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import FriendsView from "../../components/FriendsPage/FriendsView";
import PendingRequestsView from "../../components/FriendsPage/PendingRequestsView";

const FriendsPage = () => {
  const [switchedView, setSwitchedView] = useState(false);

  const handleClick = () => {
    setSwitchedView((prevState) => !prevState);
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
          {switchedView ? "Pending requests" : "Friends"}
        </Text>
        <HStack
          as={"nav"}
          spacing={4}
          alignSelf="flex-start"
          marginLeft="3"
          display={{ base: "none", md: "flex" }}
        >
          <Button
            onClick={handleClick}
            colorScheme={switchedView ? "gray" : "facebook"}
          >
            Friends List
          </Button>
          <Button
            onClick={handleClick}
            colorScheme={switchedView ? "facebook" : "gray"}
          >
            Pending Requests
          </Button>
        </HStack>
        {switchedView ? <PendingRequestsView /> : <FriendsView />}
      </Stack>
    </Flex>
  );
};

export default FriendsPage;
