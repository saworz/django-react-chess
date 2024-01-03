import { Box, Skeleton, Text, Flex } from "@chakra-ui/react";

const LoadingScreen = () => {
  return (
    <Flex
      alignItems={"center"}
      justifyContent={"flex-start"}
      flex={1}
      width="100%"
      direction="column"
    >
      <Text fontSize={"4rem"} fontWeight="black">
        Chess Game
      </Text>
      <Box
        display="flex"
        height="80vh"
        justifyContent="center"
        alignContent="center"
        flexDirection="column"
      >
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
        <Skeleton height={"20px"} w={"50rem"} marginBottom={"1rem"} />
      </Box>
    </Flex>
  );
};

export default LoadingScreen;
