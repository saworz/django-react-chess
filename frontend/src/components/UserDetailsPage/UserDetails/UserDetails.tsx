import {
  Box,
  useColorModeValue,
  Image,
  Text,
  Button,
  Stack,
} from "@chakra-ui/react";
import UserDetailsButtons from "../UserDetailsButtons";
import * as Types from "./UserDetails.types";
import { EmailIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router";

const UserDetails = ({ user }: Types.IProps) => {
  const navigate = useNavigate();

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
    >
      <Stack
        direction={{ base: "column", sm: "column", md: "row", "2md": "row" }}
        justifyContent={{
          lg: "flex-start",
          "3md": "center",
          xl: "flex-start",
        }}
        alignItems={{ base: "center", sm: "center", md: "center" }}
      >
        <Stack p={3} display={{ lg: "block", "3md": "none", xl: "block" }}>
          <Image
            alignSelf={{ base: "center", md: "left" }}
            src={"http://localhost:8000" + user.image}
            alt={"Avatar " + user.username}
            boxSize={{
              base: "110px",
              lg: "140px",
              xl: "200px",
              "2xl": "280px",
            }}
            objectFit="cover"
            height={{ base: "110px", lg: "140px", xl: "200px", "2xl": "280px" }}
          />
        </Stack>
        <Stack p={3} h="100%">
          <Text
            w="100%"
            marginLeft="3"
            textAlign="left"
            fontSize={"2rem"}
            fontWeight="bold"
          >
            {user.username}
          </Text>
          <Text
            w="100%"
            marginLeft="3"
            textAlign="left"
            fontSize={"1.5rem"}
            fontWeight="normal"
          >
            {user.email}
          </Text>
          <Stack marginLeft="2" alignSelf="flex-start" h="100%">
            <UserDetailsButtons userDetails={user} />
            <Button
              onClick={() => navigate(`/user_details/${user.id}/chat`)}
              leftIcon={<EmailIcon />}
              colorScheme="orange"
              w="100%"
              size="md"
            >
              Send Message
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default UserDetails;
