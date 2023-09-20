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
import { AppDispatch, RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../features/auth/authSlice";
import { toast } from "react-toastify";
import * as SharedTypes from "../../shared/types";

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isError, message } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = () => {
    const loginData: SharedTypes.ILoginUserData = {
      username,
      password,
    };
    dispatch(login(loginData)).then((response) => {
      if (response.meta.requestStatus === "fulfilled") {
        toast.success(`${response.payload.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        navigate("/dashboard");
      } else if (response.meta.requestStatus === "rejected") {
        toast.error(
          `${response.payload.message.slice(0, -1)} - ${
            response.payload.errors[Object.keys(response.payload.errors)[0]]
          }`,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          }
        );
      }
    });
  };

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
                <FormLabel>Login</FormLabel>
                <Input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                <Button
                  onClick={handleLogin}
                  colorScheme="orange"
                  variant="solid"
                >
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
