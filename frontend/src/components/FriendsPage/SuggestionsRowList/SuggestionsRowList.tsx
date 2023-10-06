import { Stack } from "@chakra-ui/react";
import SuggestionsRow from "../SuggestionsRow";
import * as Types from "./SuggestionsRowList.types";

const SuggestionsRowList = ({ suggestionList }: Types.IProps) => {
  return (
    <Stack spacing={5}>
      {suggestionList.map((user) => (
        <SuggestionsRow
          id={user.id}
          username={user.username}
          email={user.email}
          image={user.image}
          is_friend={user.is_friend}
          pending_request={user.pending_request}
          request_sender_id={user.request_sender_id}
          key={user.id}
        />
      ))}
    </Stack>
  );
};

export default SuggestionsRowList;
