import {
  Box,
  HStack,
  VStack,
  useColorModeValue,
  Image,
  Text,
  Button,
  Stack,
} from "@chakra-ui/react";
import UserDetailsButtons from "../UserDetailsButtons";
import * as Types from "./UserDetails.types";
import { EmailIcon } from "@chakra-ui/icons";

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
    >
      <HStack>
        <VStack p={3}>
          <Image
            alignSelf={{ base: "center", md: "left" }}
            src={"http://localhost:8000" + user.image}
            alt={"Avatar " + user.username}
            boxSize={{ base: "110px", "2xl": "280px" }}
            objectFit="cover"
            height={{ base: "110px", "2xl": "280px" }}
          />
        </VStack>
        <VStack p={3} h="100%" alignSelf="flex-start">
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
          <Stack alignSelf="flex-end" h="100%">
            <UserDetailsButtons userDetails={user} />
            <Button
              leftIcon={<EmailIcon />}
              colorScheme="orange"
              w="100%"
              size="md"
            >
              Send Message
            </Button>
          </Stack>
        </VStack>
      </HStack>
    </Box>
  );
};

export default UserDetails;
