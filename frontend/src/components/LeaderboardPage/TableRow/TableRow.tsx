import { Box, Stack, Image, Text, useColorModeValue } from "@chakra-ui/react";
import * as Types from "./TableRow.types";

const TableRow = ({ userScoreDetails }: Types.IProps) => {
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
        src={"http://localhost:8000" + userScoreDetails.image}
        alt={"Avatar " + userScoreDetails.username}
        boxSize="110px"
        height={{ base: "135px", "2xl": "110px" }}
      ></Image>
      <Box
        w="100%"
        alignSelf="center"
        textAlign={{ base: "center", md: "left" }}
        p={2}
      >
        <Text fontWeight="black">{userScoreDetails.username}</Text>
        <Text fontWeight="normal">{userScoreDetails.email}</Text>
      </Box>
      <Box alignSelf="center">
        <Stack direction={{ base: "column", "2xl": "row" }}></Stack>
      </Box>
    </Stack>
  );
};

export default TableRow;
