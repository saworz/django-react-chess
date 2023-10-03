import {
  Box,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import SearchForm from "../SearchForm";
import SuggestionsCountIndex from "../SuggestionsCountIndex";
import FriendsCountIndex from "../FriendsCountIndex";
import SuggestionsRowList from "../SuggestionsRowList";
import { useEffect, useState } from "react";
import FriendsRowList from "../FriendsRowList";
import {
  getSuggestionsList,
  setSuggestions,
  getFriendsList,
} from "../../../features/friendSystem/friendSystemSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";

const FriendsView = () => {
  const [searchInput, setSearchInput] = useState("");
  const dispatch: AppDispatch = useDispatch();
  const { friendSystem, isLoading } = useSelector(
    (state: RootState) => state.friendSystem
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const getSuggestionFriends = async () => {
    dispatch(getSuggestionsList(searchInput)).then(() => {});
  };

  const getFriends = async () => {
    dispatch(getFriendsList()).then(() => {});
  };

  useEffect(() => {
    if (searchInput !== "") {
      getSuggestionFriends();
      getFriends();
    } else {
      setSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    getFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderSuggestionList = () => {
    if (isLoading) {
      //Waiting for response
      return (
        <Stack h="72vh">
          <Skeleton height="142px" bg="blue.500" color="white" />
          <Skeleton height="142px" bg="blue.500" color="white" />
        </Stack>
      );
    } else {
      //Input is empty, no results
      if (searchInput === "") {
        return null;
      } else {
        if (
          friendSystem.suggestionsList.filter(
            (item) => item.is_friend === false
          ).length === 0
        ) {
          //Input is no empty, no results
          <Stack justifyContent="center">
            <Text margin="20" fontWeight="black" fontSize={"2rem"}>
              No results found :(
            </Text>
          </Stack>;
        } else if (
          //Input is no empty, there are some results
          friendSystem.suggestionsList.filter(
            (item) => item.is_friend === false
          ).length > 0
        ) {
          return (
            <SuggestionsRowList
              suggestionList={friendSystem.suggestionsList.filter(
                (item) =>
                  (item.is_friend === false &&
                    item.request_sender_id === user?.id) ||
                  (item.request_sender_id === null && item.is_friend === false)
              )}
            />
          );
        }
      }
    }
  };

  const renderFriendList = () => {
    if (isLoading) {
      //Waiting for response
      return (
        <Stack>
          <Skeleton height="142px" bg="blue.500" color="white" />
          <Skeleton height="142px" bg="blue.500" color="white" />
        </Stack>
      );
    } else if (friendSystem.friendsList.length > 0 && searchInput === "") {
      //If there are some friends (inital state - without any search)
      return <FriendsRowList friendList={friendSystem.friendsList} />;
    } else if (
      friendSystem.suggestionsList.length === 0 &&
      friendSystem.friendsList.length === 0 &&
      searchInput !== ""
    ) {
      //If no one with that name is found at all and there is no one with that name on the friends list
      return null;
    } else if (
      searchInput !== "" &&
      friendSystem.suggestionsList.filter((item) => item.is_friend === true)
        .length === 0
    ) {
      //When searching for a user, there is no friend with that name in the friends list
      return (
        <Stack justifyContent="center">
          <Text margin="20" fontWeight="black" fontSize={"2rem"}>
            No results found :(
          </Text>
        </Stack>
      );
    } else if (
      searchInput !== "" &&
      friendSystem.suggestionsList.length !== 0
    ) {
      //When searching for a user, there is friend with that name in the friends list
      return (
        <FriendsRowList
          friendList={friendSystem.suggestionsList.filter(
            (item) => item.is_friend === true
          )}
        />
      );
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
    <Box
      rounded={"lg"}
      bg={useColorModeValue("white", "gray.700")}
      boxShadow={"lg"}
      w="100%"
      maxH={{ base: "", md: "80vh" }}
      marginBottom="10"
      p={8}
      textAlign="center"
      overflowY="auto"
    >
      <Stack spacing={4} h="100%" minHeight="100%">
        <SearchForm inputValue={searchInput} setInputValue={setSearchInput} />
        {friendSystem.friendsList.length && (
          <FriendsCountIndex
            count={
              searchInput !== "" &&
              friendSystem.suggestionsList.filter(
                (item) => item.is_friend === true
              ).length === 0
                ? 0
                : friendSystem.friendsList.length
            }
          />
        )}
        {renderFriendList()}
        {searchInput && (
          <SuggestionsCountIndex
            count={
              friendSystem.suggestionsList.filter(
                (item) => item.is_friend !== true
              ).length
            }
          />
        )}
        {renderSuggestionList()}
      </Stack>
    </Box>
  );
};

export default FriendsView;
