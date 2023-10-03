import { Box, Stack, useColorModeValue, Text } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import PendingRequestsCountIndex from "../PendingRequestsCountIndex";
import PendingSuggestionsRowList from "../PendingSuggestionsRowList";
import {
  getSuggestionsList,
  setPendingRequests,
} from "../../../features/friendSystem/friendSystemSlice";
import { useEffect } from "react";

const PendingRequestsView = () => {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { friendSystem } = useSelector(
    (state: RootState) => state.friendSystem
  );

  const getPendingRequests = async () => {
    dispatch(getSuggestionsList(friendSystem.searchInput)).then(() => {
      dispatch(
        setPendingRequests(
          friendSystem.suggestionsList.filter(
            (item) =>
              item.is_friend === false &&
              item.request_sender_id !== user?.id &&
              item.pending_request === true
          )
        )
      );
    });
  };

  const renderPendingRequests = () => {
    if (friendSystem.pendingRequests.length === 0) {
      <Stack justifyContent="center">
        <Text margin="20" fontWeight="black" fontSize={"2rem"}>
          No results found :(
        </Text>
      </Stack>;
    } else if (friendSystem.pendingRequests.length > 0) {
      return (
        <PendingSuggestionsRowList
          pendingRequests={friendSystem.pendingRequests}
        />
      );
    }
  };

  useEffect(() => {
    getPendingRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      rounded={"lg"}
      bg={useColorModeValue("white", "gray.700")}
      boxShadow={"lg"}
      w="100%"
      maxH={{ base: "", md: "80vh" }}
      marginBottom="10"
      p={8}
      textAlign="center"
      overflowY="auto"
    >
      <Stack spacing={4} h="100%" minHeight="100%">
        {friendSystem.friendsList.length && (
          <PendingRequestsCountIndex
            count={
              friendSystem.pendingRequests.length === 0
                ? 0
                : friendSystem.pendingRequests.length
            }
          />
        )}
        {renderPendingRequests()}
      </Stack>
    </Box>
  );
};

export default PendingRequestsView;
