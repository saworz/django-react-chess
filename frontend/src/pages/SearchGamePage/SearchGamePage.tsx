import { Flex, Text, ScaleFade, Button, Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import HttpService from "../../utils/HttpService";
import SearchInfo from "../../components/SearchGamePage/SearchInfo";

const SearchGamePage = () => {
  const [isSearchingGame, setIsSearchingGame] = useState(false);

  const handleRequest = () => {
    HttpService.addUserToQueue()
      .then((response) => {
        if (response?.status === 200) {
          setIsSearchingGame(true);
        } else {
          setIsSearchingGame(false);
        }
      })
      .catch((error) => {
        const response = error.response;
        if (
          response.data.message === "User already in queue" &&
          response.status === 400
        ) {
          setIsSearchingGame(true);
        }
      });
  };
  useEffect(() => {
    handleRequest();
  }, []);

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"center"}
      flex={1}
      direction="column"
    >
      <ScaleFade
        transition={{ enter: { duration: 0.7 } }}
        initialScale={0.5}
        in={true}
      >
        <Box display="flex" justifyContent="center" flexDirection="column">
          {isSearchingGame ? (
            <SearchInfo
              setIsSearchingGame={setIsSearchingGame}
              isSearchingGame={isSearchingGame}
            />
          ) : (
            <>
              <Text fontSize={"2rem"} fontWeight="black">
                Find the game
              </Text>
              <Button onClick={handleRequest}>PLAY</Button>
            </>
          )}
        </Box>
      </ScaleFade>
    </Flex>
  );
};

export default SearchGamePage;
