import { Flex, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { toast } from "react-toastify";

const GameNotFoundPage = () => {
  useEffect(() => {
    toast.error("Game not found :(", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }, []);

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"center"}
      flex={1}
      direction="column"
    >
      <Text fontSize={"4rem"} fontWeight="black">
        {`Game not found :\u0028`}
      </Text>
    </Flex>
  );
};

export default GameNotFoundPage;
