import { Box, Skeleton, Text, Flex } from "@chakra-ui/react";
import { useEffect } from "react";
import { getGameRoomDetails } from "../../../features/chess/chessSlice";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../../app/store";
import * as Types from "./LoadingScreen.types";

const LoadingScreen = ({ setIsGameDetailsLoaded }: Types.IProps) => {
  const { gameId } = useParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(getGameRoomDetails({ gameId: gameId!, yourId: user!.id })).then(
      () => setIsGameDetailsLoaded(true)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
