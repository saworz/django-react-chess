import { Box, Flex, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import AccountForm from "../../components/AccountPage/AccountForm";

const AccountPage = () => {
  return (
    <Flex alignItems={"center"} flex={1} direction="column">
      <Stack w={{ base: "100%", xl: "50%" }} alignItems={"center"}>
        <Text
          fontSize={"2rem"}
          marginLeft="3"
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
          marginBottom="10"
          p={8}
          textAlign="center"
        >
          <AccountForm />
        </Box>
      </Stack>
    </Flex>
  );
};

export default AccountPage;
