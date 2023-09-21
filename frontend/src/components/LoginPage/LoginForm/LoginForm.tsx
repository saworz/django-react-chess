import * as Yup from "yup";
import {
  FormLabel,
  FormControl,
  Input,
  Button,
  Stack,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { Formik, Field } from "formik";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../app/store";
import { toast } from "react-toastify";
import { login } from "../../../features/auth/authSlice";
import { useState } from "react";

import * as SharedStyles from "../../../shared/styles";

const SigninSchema = Yup.object().shape({
  username: Yup.string()
    .min(4, "Too Short! It must contain at least 4 characters")
    .max(16, "Too Long! It must contain at most 16 characters")
    .required("'Login' field is required"),
  password: Yup.string()
    .min(8, "Too Short! It must contain at least 8 characters")
    .max(20, "Too Long! It must contain at most 20 characters")
    .required("'Password' field is required"),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  return (
    <Formik
      initialValues={{
        username: "",
        password: "",
      }}
      validationSchema={SigninSchema}
      onSubmit={(values) => {
        dispatch(login(values)).then((response) => {
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
            toast.error(`${response.payload}`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          }
        });
      }}
    >
      {({ handleSubmit, errors, touched }) => (
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl
              isRequired
              isInvalid={!!errors.username && touched.username}
            >
              <FormLabel htmlFor="username">Login</FormLabel>
              <Field
                as={Input}
                id="username"
                name="username"
                type="text"
                variant="outline"
              />
              <SharedStyles.ErrorMessage>
                {errors.username}
              </SharedStyles.ErrorMessage>
            </FormControl>
            <FormControl
              isRequired
              isInvalid={!!errors.password && touched.password}
            >
              <FormLabel htmlFor="password">Password</FormLabel>
              <InputGroup>
                <Field
                  as={Input}
                  id="password"
                  name="password"
                  variant="outline"
                  type={showPassword ? "text" : "password"}
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
              <SharedStyles.ErrorMessage>
                {errors.password}
              </SharedStyles.ErrorMessage>
            </FormControl>
            <Button mt={4} colorScheme="orange" type="submit">
              Sign in
            </Button>
          </Stack>
        </form>
      )}
    </Formik>
  );
};

export default LoginForm;
