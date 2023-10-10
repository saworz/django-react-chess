import { Box, useColorModeValue } from "@chakra-ui/react";
import * as Types from "./UserDetails.types";

const UserDetails = ({ user }: Types.IProps) => {
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
    ></Box>
  );
};

export default UserDetails;
