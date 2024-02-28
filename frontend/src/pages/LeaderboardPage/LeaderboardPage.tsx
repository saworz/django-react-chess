import { Flex, HStack, Text, Image } from "@chakra-ui/react";
import ScoreboardKingSvg from "../../images/scoreboard_king.svg";

const LeaderboardPage = () => {
  return (
    <Flex
      alignItems={"center"}
      justifyContent={"flex-start"}
      flex={1}
      direction="column"
    >
      <HStack>
        <Image src={ScoreboardKingSvg} />
        <Text fontSize={"4rem"} fontWeight="black">
          Hall of Fame
        </Text>
      </HStack>
      <Text fontSize={"2rem"} fontWeight="black">
        Top 100
      </Text>
    </Flex>
  );
};

export default LeaderboardPage;
