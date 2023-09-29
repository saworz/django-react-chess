import { Stack } from "@chakra-ui/react";
import FriendsRow from "../FriendsRow";
import * as Types from "./FriendsRowList.types";

const FriendsRowList = ({ suggestionList }: Types.IProps) => {
  return (
    <Stack spacing={5}>
      {suggestionList.map((user) => (
        <FriendsRow
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

export default FriendsRowList;
