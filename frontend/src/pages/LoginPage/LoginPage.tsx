import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  ScaleFade,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../app/store";
import { useSelector } from "react-redux";

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const { user, isError, message } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isError) {
      console.log(message);
    }

    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate, isError, message]);

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
            <Heading fontSize={"4xl"}>Sign in to your account</Heading>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            <Stack spacing={4}>
              <FormControl id="email">
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <Stack spacing={10}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                >
                  <Checkbox>Remember me</Checkbox>
                  <Text color={"blue.400"}>Forgot password?</Text>
                </Stack>
                <Button colorScheme="orange" variant="solid">
                  Sign in
                </Button>
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

export default LoginPage;