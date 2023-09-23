import { Stack } from "@chakra-ui/react";
import FriendsRow from "../FriendsRow";
import * as Types from "./FriendsRowList.types";

const FriendsRowList = ({ suggestionList }: Types.IProps) => {
  return (
    <Stack spacing={5}>
      {suggestionList.map((user) => (
        <FriendsRow
          name={user.name}
          email={user.email}
          image_url={user.image_url}
          key={user.name}
        />
      ))}
    </Stack>
  );
};

export default FriendsRowList;
