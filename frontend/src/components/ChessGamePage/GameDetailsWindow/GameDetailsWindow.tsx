import { Box, useColorModeValue, Flex } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { useEffect, useRef, useState } from "react";
import * as Styles from "./GameDetailsWindow.styles";

const GameDetailsWindow = () => {
  const { chess } = useSelector((state: RootState) => state.chess);
  const [allMovesPairs, setAllMovesPairs] = useState<string[][]>([]);
  const allGameMovesList = useRef<HTMLDivElement>(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const { allGameMoves } = chess;

  const scrollToBottom = () => {
    allGameMovesList.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const allMoves: string[][] = [];
    for (let i = 0; i < allGameMoves.length; i += 2) {
      allMoves.push([allGameMoves[i], allGameMoves[i + 1]]);
    }
    setAllMovesPairs(allMoves);

    if (screenWidth >= 1020) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allGameMoves]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Box
      rounded={"lg"}
      boxShadow={"lg"}
      p={4}
      height="100%"
      maxHeight="512.5px"
      bg={useColorModeValue("white", "gray.700")}
      alignItems="flex-start"
      display="flex"
      justifyContent="flex-start"
      overflowY="auto"
    >
      <Flex
        flexDirection="column"
        alignItems="flex-start"
        width="-webkit-fill-available"
        h="99px"
        pt="12px"
      >
        {allMovesPairs.map((pair, index) => (
          <Styles.MovesRow
            bg={index % 2 === 0 ? "#2d3748" : "#181b2e"}
            key={index}
            spacing={2}
            p={1}
          >
            <Styles.RowValue>{index + 1}.</Styles.RowValue>
            <Styles.RowValue>{pair[0]}</Styles.RowValue>
            <Styles.RowValue>{pair[1]}</Styles.RowValue>
          </Styles.MovesRow>
        ))}
        <div ref={allGameMovesList}></div>
      </Flex>
    </Box>
  );
};

export default GameDetailsWindow;
