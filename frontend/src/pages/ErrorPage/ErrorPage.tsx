import { Flex, Text } from "@chakra-ui/react";

const ErrorPage = () => {
  return (
    <Flex
      alignItems={"center"}
      justifyContent={"center"}
      flex={1}
      direction="column"
    >
      <Text fontSize={"4rem"} fontWeight="black">
        Page not found
      </Text>
    </Flex>
  );
};

export default ErrorPage;
