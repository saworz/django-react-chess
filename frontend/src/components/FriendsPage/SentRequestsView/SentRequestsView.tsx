import { Box, Stack, useColorModeValue, Text } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import SentRequestsCountIndex from "../SentRequestsCountIndex";
import SentRequestsRowList from "../SentRequestsRowList";
import { getSentRequests } from "../../../features/friendSystem/friendSystemSlice";
import { useEffect } from "react";

const SentRequestsView = () => {
  const dispatch: AppDispatch = useDispatch();
  const { friendSystem } = useSelector(
    (state: RootState) => state.friendSystem
  );

  const renderSentRequests = () => {
    if (friendSystem.sentRequests.length === 0) {
      <Stack justifyContent="center">
        <Text margin="20" fontWeight="black" fontSize={"2rem"}>
          No results found :(
        </Text>
      </Stack>;
    } else if (friendSystem.sentRequests.length > 0) {
      return <SentRequestsRowList sentRequests={friendSystem.sentRequests} />;
    }
  };

  useEffect(() => {
    dispatch(getSentRequests());
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
        {friendSystem.sentRequests.length && (
          <SentRequestsCountIndex
            count={
              friendSystem.sentRequests.length === 0
                ? 0
                : friendSystem.sentRequests.length
            }
          />
        )}
        {renderSentRequests()}
      </Stack>
    </Box>
  );
};

export default SentRequestsView;
