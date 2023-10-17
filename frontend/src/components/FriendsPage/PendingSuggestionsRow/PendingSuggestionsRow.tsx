import {
  Box,
  Stack,
  Image,
  Text,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import PendingRequestsButtons from "../PendingRequestsButtons";
import * as SharedTypes from "../../../shared/types";
import { useNavigate } from "react-router-dom";

const PendingSuggestionsRow = ({
  email,
  username,
  image,
  id,
}: SharedTypes.IPendingRequestsData) => {
  const navigate = useNavigate();
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
          <PendingRequestsButtons userId={id} />
          <Button
            onClick={() => navigate(`/user_details/${id}`)}
            colorScheme="telegram"
            size="md"
          >
            View profile
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};

export default PendingSuggestionsRow;
