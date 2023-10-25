import { Flex, Text, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HttpService from "../../utils/HttpService";
import UserDetails from "../../components/UserDetailsPage/UserDetails";
import NoUserFound from "../../components/UserDetailsPage/NoUserFound";
import * as SharedTypes from "../../shared/types";

const UserDetailsPage = () => {
  const { userId } = useParams();
  const [isUserFound, setIsUserFound] = useState(false);
  const [userDetails, setUserDetails] =
    useState<SharedTypes.ISuggestionFriendData>();

  useEffect(() => {
    HttpService.getUserDetails(Number(userId)).then((response) => {
      if (response?.status === 200) {
        setIsUserFound(true);
        setUserDetails(response.data);
      } else {
        setIsUserFound(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex
      justifyContent={!isUserFound ? "center" : ""}
      alignItems={"center"}
      flex={1}
      direction="column"
    >
      <Stack w={{ base: "100%", "3md": "50%" }} alignItems={"center"}>
        {isUserFound && (
          <Text
            marginLeft="3"
            fontSize={"2rem"}
            fontWeight="black"
            alignSelf="flex-start"
          >
            User Details
          </Text>
        )}
        {!isUserFound && <NoUserFound />}
        {userDetails && <UserDetails user={userDetails} />}
      </Stack>
    </Flex>
  );
};

export default UserDetailsPage;
