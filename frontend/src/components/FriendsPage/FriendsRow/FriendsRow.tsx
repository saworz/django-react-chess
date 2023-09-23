import {
  Box,
  Stack,
  Image,
  Text,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import * as SharedTypes from "./FriendsRow.types";

const FriendsRow = ({ email, name, image_url }: SharedTypes.IProps) => {
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
        src={"http://localhost:8000" + image_url}
        alt={"Avatar " + name}
        boxSize="110px"
        height={{ base: "135px", "2xl": "110px" }}
      ></Image>
      <Box
        w="100%"
        alignSelf="center"
        textAlign={{ base: "center", md: "left" }}
        p={2}
      >
        <Text fontWeight="black">{name}</Text>
        <Text fontWeight="normal">{email}</Text>
      </Box>
      <Box alignSelf="center">
        <Stack direction={{ base: "column", "2xl": "row" }}>
          <Button colorScheme="whatsapp" size="md">
            Add friend
          </Button>
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

export default FriendsRow;
