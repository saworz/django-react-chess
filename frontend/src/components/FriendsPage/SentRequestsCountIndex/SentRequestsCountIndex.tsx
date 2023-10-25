import { Stack, Text, useColorModeValue } from "@chakra-ui/react";
import * as Types from "./SentRequestsCountIndex.types";

const SentRequestsCountIndex = ({ count }: Types.IProps) => {
  return (
    <Stack alignItems="flex-start" direction="row">
      <Text fontWeight="black" fontSize={"1rem"} marginTop={1}>
        Sent Requests
      </Text>
      <Text
        bg={useColorModeValue("white", "gray.800")}
        fontWeight="black"
        fontSize={"1rem"}
        p={1}
      >
        {count}
      </Text>
    </Stack>
  );
};

export default SentRequestsCountIndex;
