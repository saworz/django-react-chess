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
import { register } from "../../../features/auth/authSlice";
import { useState } from "react";

import * as SharedStyles from "./../../../shared/styles";

const SignupSchema = Yup.object().shape({
  username: Yup.string()
    .min(4, "Too Short! It must contain at least 4 characters")
    .max(16, "Too Long! It must contain at most 16 characters")
    .required("'Login' field is required"),
  email: Yup.string()
    .email("Invalid email")
    .required("'Email' field is required"),
  password1: Yup.string()
    .min(8, "Too Short! It must contain at least 8 characters")
    .max(20, "Too Long! It must contain at most 20 characters")
    .required("'Password' field is required"),
  password2: Yup.string()
    .min(8, "Too Short! It must contain at least 8 characters")
    .max(20, "Too Long! It must contain at most 20 characters")
    .required("'Repeat password' field is required")
    .test(
      "passwords-match",
      "*The given password do not match",
      function (value) {
        return this.parent.password1 === value;
      }
    ),
});

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  return (
    <Formik
      initialValues={{
        username: "",
        email: "",
        password1: "",
        password2: "",
      }}
      validationSchema={SignupSchema}
      onSubmit={(values) => {
        dispatch(register(values)).then((response) => {
          if (response.meta.requestStatus === "fulfilled") {
            toast.success(`${response.payload.message.slice(0, -1)}`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
            navigate("/login");
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
            <FormControl isRequired isInvalid={!!errors.email && touched.email}>
              <FormLabel htmlFor="email">Email Address</FormLabel>
              <Field
                as={Input}
                id="email"
                name="email"
                type="email"
                variant="outline"
              />
              <SharedStyles.ErrorMessage>
                {errors.email}
              </SharedStyles.ErrorMessage>
            </FormControl>
            <FormControl
              isRequired
              isInvalid={!!errors.password1 && touched.password1}
            >
              <FormLabel htmlFor="password1">Password</FormLabel>
              <InputGroup>
                <Field
                  as={Input}
                  id="password1"
                  name="password1"
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
                {errors.password1}
              </SharedStyles.ErrorMessage>
            </FormControl>
            <FormControl
              isRequired
              isInvalid={!!errors.password2 && touched.password2}
            >
              <FormLabel htmlFor="password2">Repeat password</FormLabel>
              <InputGroup>
                <Field
                  as={Input}
                  id="password2"
                  name="password2"
                  variant="outline"
                  type={showRepeatPassword ? "text" : "password"}
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
              <SharedStyles.ErrorMessage>
                {errors.password2}
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

export default RegisterForm;
