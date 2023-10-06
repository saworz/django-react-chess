import {
  Box,
  Stack,
  Image,
  Text,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import SuggestionsRowButtons from "../SuggestionsRowButtons";
import * as SharedTypes from "../../../shared/types";

const SuggestionsRow = ({
  email,
  username,
  image,
  id,
  is_friend,
  request_sender_id: request_sender,
  pending_request,
}: SharedTypes.ISuggestionFriendData) => {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      justifyContent="inherit"
      bg={useColorModeValue("white", "gray.600")}
      p={4}
      rounded={"xl"}
    >
      <Image
        alignSelf={{ base: "center", md: "left" }}
        src={"http://localhost:8000" + image}
        alt={"Avatar " + username}
        boxSize="110px"
        height={{ base: "135px", "2xl": "110px" }}
      ></Image>
      <Box
        w="100%"
        alignSelf="center"
        textAlign={{ base: "center", md: "left" }}
        p={2}
      >
        <Text fontWeight="black">{username}</Text>
        <Text fontWeight="normal">{email}</Text>
      </Box>
      <Box alignSelf="center">
        <Stack direction={{ base: "column", "2xl": "row" }}>
          <SuggestionsRowButtons
            userId={id}
            userDetails={{ is_friend, request_sender, pending_request }}
          />
          <Button colorScheme="telegram" size="md">
            View profile
          </Button>
          <Button colorScheme="orange" size="md">
            Send Message
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};

export default SuggestionsRow;
