import { Box, Stack, Image, Text, useColorModeValue } from "@chakra-ui/react";
import GoldMedalImg from "../../../images/gold-medal.png";
import SilverMedalImg from "../../../images/silver-medal.png";
import BronzeMedalImg from "../../../images/bronze-medal.png";
import * as Types from "./TableRow.types";
import * as Styles from "./TableRow.styles";

const TableRow = ({ userScoreDetails, position }: Types.IProps) => {
  const showPositionMedal = (position: number) => {
    switch (position) {
      case 1:
        return (
          <Image
            alignSelf={{ base: "center", md: "left" }}
            src={GoldMedalImg}
            alt={"GoldMedalImg"}
            boxSize={{ base: "70px", "2xl": "60px" }}
            height={{ base: "70px", "2xl": "60px" }}
          />
        );

      case 2:
        return (
          <Image
            alignSelf={{ base: "center", md: "left" }}
            src={SilverMedalImg}
            alt={"SilverMedalImg"}
            boxSize={{ base: "70px", "2xl": "60px" }}
            height={{ base: "70px", "2xl": "60px" }}
          />
        );

      case 3:
        return (
          <Image
            alignSelf={{ base: "center", md: "left" }}
            src={BronzeMedalImg}
            alt={"BronzeMedalImg"}
            boxSize={{ base: "70px", "2xl": "60px" }}
            height={{ base: "70px", "2xl": "60px" }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Styles.LeaderboardStack
      justifyContent="inherit"
      bg={useColorModeValue("white", "gray.600")}
      p={4}
      w="500px"
      rounded={"xl"}
    >
      <Image
        alignSelf={{ base: "center", md: "left" }}
        src={"http://localhost:8000" + userScoreDetails.image}
        alt={"Avatar " + userScoreDetails.username}
        boxSize={{ base: "120px", "2xl": "110px" }}
        height={{ base: "135px", "2xl": "110px" }}
      />
      <Styles.DetailsContainer
        w="100%"
        alignSelf="flex-start"
        textAlign={{ base: "center", md: "left" }}
        ml={2}
      >
        <Text fontSize="2xl" fontWeight="black">
          {userScoreDetails.username}
        </Text>
        <Text fontWeight="normal" fontSize="xl">
          Wins: {userScoreDetails.wins}
        </Text>
        <Text fontWeight="normal" fontSize="xl">
          Losses: {userScoreDetails.losses}
        </Text>
      </Styles.DetailsContainer>
      <Stack direction={{ base: "column", "2xl": "row" }}>
        <Text fontWeight="normal" fontSize="xl" w="-webkit-max-content">
          {`${userScoreDetails.elo} | #${position + 1}`}
        </Text>
        {showPositionMedal(position + 1)}
      </Stack>
    </Styles.LeaderboardStack>
  );
};

export default TableRow;
