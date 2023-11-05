import { Flex, Text } from "@chakra-ui/react";
import ChessBoard from "../../components/ChessGamePage/ChessBoard";
import { useParams } from "react-router-dom";
import { useState } from "react";

const ChessGamePage = () => {
  const { userId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [gameRoomId, setGameRoomId] = useState(0);

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"flex-start"}
      flex={1}
      direction="column"
    >
      <Text fontSize={"4rem"} fontWeight="black">
        Chess Game
      </Text>
      <ChessBoard />
    </Flex>
  );
};

export default ChessGamePage;
