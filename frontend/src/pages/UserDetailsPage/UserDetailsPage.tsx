import { Flex, Text, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HttpService from "../../utils/HttpService";
import UserDetails from "../../components/UserDetailsPage/UserDetails";
import * as SharedTypes from "../../shared/types";

const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] =
    useState<SharedTypes.ISuggestionFriendData>();

  useEffect(() => {
    if (userId) {
      HttpService.getUserDetails(Number(userId)).then((response) =>
        setUserDetails(response)
      );
    } else {
      navigate("/error");
    }
  }, []);

  return (
    <Flex alignItems={"center"} flex={1} direction="column">
      <Stack w={{ base: "100%", lg: "50%" }} alignItems={"center"}>
        <Text
          marginLeft="3"
          fontSize={"2rem"}
          fontWeight="black"
          alignSelf="flex-start"
        >
          User Details
        </Text>
        {userDetails && <UserDetails user={userDetails} />}
      </Stack>
    </Flex>
  );
};

export default UserDetailsPage;
