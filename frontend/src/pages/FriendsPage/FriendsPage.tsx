import {
  Box,
  Flex,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import SearchForm from "../../components/FriendsPage/SearchForm";
import SuggestionsCountIndex from "../../components/FriendsPage/SuggestionsCountIndex";
import FriendsCountIndex from "../../components/FriendsPage/FriendsCountIndex/FriendsCountIndex";
import FriendsRowList from "../../components/FriendsPage/FriendsRowList";
import { useEffect, useState } from "react";
import axios from "axios";
import TokenService from "../../app/tokenService";
import * as SharedTypes from "../../shared/types";

const API_URL = "http://localhost:8000/api/";

const FriendsPage = () => {
  const [friendsList, setFriendsList] = useState<SharedTypes.IFriendData[]>([]);
  const [suggestionsList, setSuggestionsList] = useState<
    SharedTypes.ISuggestionFriendData[]
  >([]);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);

  const getSuggestionFriends = async () => {
    setIsLoading(true);
    await axios
      .get(API_URL + `users/list_profiles/${searchInput}/`, {
        headers: {
          Authorization: TokenService.getAccessToken(),
        },
      })
      .then((response) => {
        setSuggestionsList(response.data);
        setIsLoading(false);
      });
  };

  const getFriendsList = async () => {
    setIsLoadingFriends(true);
    await axios
      .get(API_URL + "friends/get_friends_list/", {
        withCredentials: true,
        headers: {
          "x-csrftoken": TokenService.getCsrfToken(),
        },
      })
      .then((response) => {
        setFriendsList(response.data);
        setIsLoadingFriends(false);
      });
  };

  useEffect(() => {
    if (searchInput !== "") {
      getSuggestionFriends();
      getFriendsList();
    } else {
      setSuggestionsList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    //getFriendsList();
  }, []);

  const renderSuggestionList = () => {
    if (isLoading) {
      return (
        <Stack h="72vh">
          <Skeleton height="142px" bg="blue.500" color="white" />
          <Skeleton height="142px" bg="blue.500" color="white" />
        </Stack>
      );
    } else if (
      suggestionsList.filter((item) => item.is_friend !== true).length > 0 &&
      searchInput
    ) {
      return (
        <FriendsRowList
          suggestionList={suggestionsList.filter(
            (item) => item.is_friend !== true
          )}
        />
      );
    } else if (
      searchInput !== "" &&
      suggestionsList.filter((item) => item.is_friend !== true).length === 0
    ) {
      return (
        <Stack justifyContent="center">
          <Text margin="20" fontWeight="black" fontSize={"2rem"}>
            No results found :(
          </Text>
        </Stack>
      );
    }
  };

  const renderFriendList = () => {
    if (isLoadingFriends) {
      //Waiting for response
      return (
        <Stack>
          <Skeleton height="142px" bg="blue.500" color="white" />
          <Skeleton height="142px" bg="blue.500" color="white" />
        </Stack>
      );
    } else if (friendsList.length > 0 && searchInput === "") {
      //If there are some friends (inital state - without any search)
      return <FriendsRowList suggestionList={friendsList} />;
    } else if (
      searchInput !== "" &&
      suggestionsList.filter((item) => item.is_friend === true).length === 0
    ) {
      //When searching for a user, there is no friend with that name in the friends list
      return (
        <Stack h="72vh" justifyContent="center">
          <Text marginBottom="20" fontWeight="black" fontSize={"2rem"}>
            No results found :(
          </Text>
        </Stack>
      );
    } else if (searchInput !== "" && suggestionsList.length !== 0) {
      //When searching for a user, there is friend with that name in the friends list
      return (
        <FriendsRowList
          suggestionList={suggestionsList.filter(
            (item) => item.is_friend === true
          )}
        />
      );
    } else if (
      suggestionsList.length === 0 &&
      friendsList.length === 0 &&
      searchInput !== ""
    ) {
      //If no one with that name is found at all and there is no one with that name on the friends list
      return null;
    } else {
      return (
        //If you don't have any friend on your friends list and you don't try to search for anyone (initial state without any friend on your friends list)
        <Text fontWeight="black" fontSize={"1rem"}>
          Use the text field above to add or find friends!
        </Text>
      );
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
          Friends
        </Text>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          w="100%"
          maxH={{ base: "", md: "80vh" }}
          marginBottom="10"
          p={8}
          textAlign="center"
        >
          <Stack spacing={4} h="100%" minHeight="100%">
            <SearchForm
              inputValue={searchInput}
              setInputValue={setSearchInput}
            />
            {friendsList.length && (
              <FriendsCountIndex
                count={
                  searchInput !== "" &&
                  suggestionsList.filter((item) => item.is_friend === true)
                    .length === 0
                    ? 0
                    : friendsList.length
                }
              />
            )}
            {renderFriendList()}
            {searchInput && (
              <SuggestionsCountIndex
                count={
                  suggestionsList.filter((item) => item.is_friend !== true)
                    .length
                }
              />
            )}
            {renderSuggestionList()}
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default FriendsPage;
