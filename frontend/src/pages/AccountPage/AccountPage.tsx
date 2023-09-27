import { Box, Flex, Stack, Text, useColorModeValue } from "@chakra-ui/react";

const AccountPage = () => {
  return (
    <Flex alignItems={"center"} flex={1} direction="column">
      <Stack w={{ base: "100%", lg: "50%" }} alignItems={"center"}>
        <Text
          marginLeft="3"
          fontSize={"2rem"}
          fontWeight="black"
          alignSelf="flex-start"
        >
          Account settings
        </Text>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          w="100%"
          maxH={{ base: "", md: "80vh" }}
          marginBottom="10"
          p={8}
          textAlign="center"
        >
          <Stack spacing={4} h="100%" minHeight="100%"></Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default AccountPage;
