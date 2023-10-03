import { Stack } from "@chakra-ui/react";
import PendingSuggestionsRow from "../PendingSuggestionsRow/PendingSuggestionsRow";
import * as Types from "./PendingSuggestionsRowList.types";

const PendingSuggestionsRowList = ({ pendingRequests }: Types.IProps) => {
  return (
    <Stack spacing={5}>
      {pendingRequests.map((user) => (
        <PendingSuggestionsRow
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

export default PendingSuggestionsRowList;
