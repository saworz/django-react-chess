import { Box, Flex, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import SearchForm from "../../components/FriendsPage/SearchForm";
import FriendsCountIndex from "../../components/FriendsPage/FriendsCountIndex";
import FriendsRowList from "../../components/FriendsPage/FriendsRowList";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api/users/";

const FriendsPage = () => {
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const getData = async () => {
    const response = await axios.get(
      API_URL + `list_profiles?search_string=${searchInput}`
    );
    setSuggestionsList(response.data.search_results);
  };

  useEffect(() => {
    if (searchInput !== "") {
      getData();
    } else {
      setSuggestionsList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const renderResults = () => {
    if (suggestionsList.length > 0 && searchInput) {
      return <FriendsRowList suggestionList={suggestionsList} />;
    } else if (searchInput !== "" && suggestionsList.length === 0) {
      return (
        <Stack h="72vh" justifyContent="center">
          <Text marginBottom="20" fontWeight="black" fontSize={"2rem"}>
            No results found :(
          </Text>
        </Stack>
      );
    } else {
      return (
        <Text fontWeight="black" fontSize={"1rem"}>
          Use the text field above to add or find friends!
        </Text>
      );
    }
  };

  return (
    <Flex alignItems={"center"} flex={1} direction="column">
      <Stack w="50%" alignItems={"center"}>
        <Text
          marginLeft="5"
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
          maxH="80vh"
          marginBottom="10"
          p={8}
          textAlign="center"
        >
          <Stack spacing={4} h="100%" minHeight="100%">
            <SearchForm
              inputValue={searchInput}
              setInputValue={setSearchInput}
            />
            <FriendsCountIndex count={suggestionsList.length} />
            {renderResults()}
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default FriendsPage;
