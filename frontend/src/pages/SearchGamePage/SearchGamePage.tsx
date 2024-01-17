import { Flex, Text, ScaleFade, Button, Box } from "@chakra-ui/react";
import { useState } from "react";
import SearchInfo from "../../components/SearchGamePage/SearchInfo";

const SearchGamePage = () => {
  const [isSearchingGame, setIsSearchingGame] = useState(false);

  const handleClick = () => {
    setIsSearchingGame(true);
  };

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
              <Button onClick={handleClick}>PLAY</Button>
            </>
          )}
        </Box>
      </ScaleFade>
    </Flex>
  );
};

export default SearchGamePage;
