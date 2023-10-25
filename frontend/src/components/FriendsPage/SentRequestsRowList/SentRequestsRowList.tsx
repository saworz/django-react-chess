import { Stack } from "@chakra-ui/react";
import SentRequestsRow from "../SentRequestsRow/SentRequestsRow";
import * as Types from "./SentRequestsRowList.types";

const SentRequestsRowList = ({ sentRequests }: Types.IProps) => {
  return (
    <Stack spacing={5}>
      {sentRequests.map((user) => (
        <SentRequestsRow
          id={user.id}
          username={user.username}
          email={user.email}
          image={user.image}
          key={user.id}
        />
      ))}
    </Stack>
  );
};

export default SentRequestsRowList;
