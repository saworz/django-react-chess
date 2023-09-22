import {
  Flex,
  Box,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
  ScaleFade,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../app/store";
import { useSelector } from "react-redux";
import RegisterForm from "../../components/RegisterPage/RegisterForm";

const RegisterPage = () => {
  const navigate = useNavigate();

  const { isError, message } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isError) {
      console.log(message);
    }
  }, [navigate, isError, message]);

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"center"}
      flex={1}
      direction="column"
    >
      <ScaleFade
        transition={{ enter: { duration: 0.7 } }}
        initialScale={0.5}
        in={true}
      >
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading fontSize={"4xl"} textAlign={"center"}>
              Sign up your account
            </Heading>
            <Text fontSize={"lg"} color={"gray.600"}>
              to play chess ✌️
            </Text>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            <Stack spacing={4}>
              <RegisterForm />
              <Stack pt={6}>
                <Text align={"center"}>
                  Already a user?{" "}
                  <Link onClick={() => navigate("/login")} color={"blue.400"}>
                    Sign in
                  </Link>
                </Text>
                <Button
                  onClick={() => navigate("/")}
                  colorScheme="orange"
                  variant="outlined"
                >
                  Back
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </ScaleFade>
    </Flex>
  );
};

export default RegisterPage;
