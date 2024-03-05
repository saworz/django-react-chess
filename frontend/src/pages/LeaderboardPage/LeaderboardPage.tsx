import {
  Flex,
  HStack,
  Text,
  Image,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import ScoreboardKingSvg from "../../images/scoreboard_king.svg";
import { useEffect, useState } from "react";
import axios from "axios";
import TokenService from "../../app/tokenService";
import * as SharedTypes from "../../shared/types";
import TableRowList from "../../components/LeaderboardPage/TableRowList";

const API_URL = "http://localhost:8000/api/";

const LeaderboardPage = () => {
  const [scoreboardList, setScoreboardList] = useState<
    SharedTypes.IScoreboardList[]
  >([]);

  const getScoreboardList = async () => {
    const response = await axios.get(API_URL + `users/get_leaderboard`, {
      withCredentials: true,
      headers: {
        "X-CSRFToken": TokenService.getCsrfToken(),
        "Content-Type": "application/json",
      },
    });

    return response.data;
  };

  useEffect(() => {
    getScoreboardList().then((response) => setScoreboardList(response));
  }, []);

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
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
        textAlign="center"
        height="70vh"
      >
        <TableRowList scoreboardList={scoreboardList} />
      </Box>
    </Flex>
  );
};

export default LeaderboardPage;
