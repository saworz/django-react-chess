import { Box, useColorModeValue, Text } from "@chakra-ui/react";

const GameDetailsWindow = () => {
  return (
    <Box
      rounded={"lg"}
      boxShadow={"lg"}
      p={4}
      height="100%"
      bg={useColorModeValue("white", "gray.700")}
      alignItems="center"
      display="flex"
      justifyContent="center"
    >
      <Text textAlign="center" fontSize={"4rem"} fontWeight="black">
        Coming soon...
      </Text>
    </Box>
  );
};

export default GameDetailsWindow;
