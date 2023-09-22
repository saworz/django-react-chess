import { Box, Flex, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import SearchForm from "../../components/FriendsPage/SearchForm";

const FriendsPage = () => {
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
          h="80vh"
          marginBottom="10"
          p={8}
          textAlign="center"
        >
          <SearchForm />
        </Box>
      </Stack>
    </Flex>
  );
};

export default FriendsPage;
