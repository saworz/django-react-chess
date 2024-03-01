import { Stack } from "@chakra-ui/react";
import TableRow from "../TableRow/TableRow";
import * as Types from "./TableRowList.types";

const TableRowList = ({ scoreboardList }: Types.IProps) => {
  return (
    <Stack spacing={5}>
      {scoreboardList.map((user, index) => (
        <TableRow key={user.id} userScoreDetails={user} position={index} />
      ))}
    </Stack>
  );
};

export default TableRowList;
