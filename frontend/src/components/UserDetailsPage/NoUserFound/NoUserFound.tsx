import { Text, Box } from "@chakra-ui/react";

const NoUserFound = () => {
  return (
    <Box
      w="100%"
      maxH={{ base: "", md: "80vh" }}
      marginBottom="10"
      p={8}
      textAlign="center"
    >
      <Text fontSize={"3rem"} fontWeight="black">
        No user found
      </Text>
    </Box>
  );
};

export default NoUserFound;
