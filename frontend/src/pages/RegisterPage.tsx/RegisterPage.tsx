import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
  ScaleFade,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../features/auth/authSlice";
import * as SharedTypes from "../../shared/types";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [userLogin, setUserLogin] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const { user, isError, message } = useSelector(
    (state: RootState) => state.auth
  );

  const handleRegister = () => {
    const loginData: SharedTypes.IRegisterUserData = {
      login: userLogin,
      email,
      password1: password,
      password2: repeatPassword,
    };
    dispatch(register(loginData));
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
              <FormControl id="login">
                <FormLabel>Login</FormLabel>
                <Input
                  type="text"
                  value={userLogin}
                  onChange={(e) => setUserLogin(e.target.value)}
                />
              </FormControl>
              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement h={"full"}>
                    <Button
                      variant={"ghost"}
                      onClick={() =>
                        setShowPassword((showPassword) => !showPassword)
                      }
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl id="repeat-password" isRequired>
                <FormLabel>Repeat password</FormLabel>
                <InputGroup>
                  <Input
                    type={showRepeatPassword ? "text" : "password"}
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                  <InputRightElement h={"full"}>
                    <Button
                      variant={"ghost"}
                      onClick={() =>
                        setShowRepeatPassword(
                          (showRepeatPassword) => !showRepeatPassword
                        )
                      }
                    >
                      {showRepeatPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Stack spacing={10} pt={2}>
                <Button
                  loadingText="Submitting"
                  size="lg"
                  colorScheme="orange"
                  variant="solid"
                  onClick={handleRegister}
                >
                  Sign up
                </Button>
              </Stack>
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
