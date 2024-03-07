import { Flex, HStack, useColorModeValue } from "@chakra-ui/react";
import ScoreboardKingSvg from "../../images/scoreboard_king.svg";
import { useEffect, useState } from "react";
import axios from "axios";
import TokenService from "../../app/tokenService";
import TableRowList from "../../components/LeaderboardPage/TableRowList";
import * as SharedTypes from "../../shared/types";
import * as Styles from "./LeaderboardPage.styles";

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
        <Styles.PageTitleIcon src={ScoreboardKingSvg} />
        <Styles.PageTitle>Hall of Fame</Styles.PageTitle>
      </HStack>
      <Styles.PageSubTitle>Top 100</Styles.PageSubTitle>
      <Styles.TableRowListContainer
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
        textAlign="center"
      >
        <TableRowList scoreboardList={scoreboardList} />
      </Styles.TableRowListContainer>
    </Flex>
  );
};

export default LeaderboardPage;
