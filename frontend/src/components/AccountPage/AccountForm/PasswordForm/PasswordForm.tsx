import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  InputRightElement,
  InputGroup,
} from "@chakra-ui/react";
import { Formik, Field } from "formik";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";
import HttpService from "../../../../utils/HttpService";
import * as Yup from "yup";
import * as SharedStyles from "../../../../shared/styles";

const PasswordSchema = Yup.object().shape({
  old_password: Yup.string()
    .min(8, "Too Short! It must contain at least 8 characters")
    .max(20, "Too Long! It must contain at most 20 characters")
    .required("'Password' field is required"),
  new_password: Yup.string()
    .min(8, "Too Short! It must contain at least 8 characters")
    .max(20, "Too Long! It must contain at most 20 characters")
    .required("'Password' field is required"),
  repeated_password: Yup.string()
    .min(8, "Too Short! It must contain at least 8 characters")
    .max(20, "Too Long! It must contain at most 20 characters")
    .required("'Repeat password' field is required")
    .test(
      "passwords-match",
      "*The given password do not match",
      function (value) {
        return this.parent.new_password === value;
      }
    ),
});

const PasswordForm = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Formik
      initialValues={{
        old_password: "",
        new_password: "",
        repeated_password: "",
      }}
      validationSchema={PasswordSchema}
      onSubmit={(values) => {
        const passwordData = {
          old_password: values.old_password,
          new_password: values.new_password,
          repeated_password: values.repeated_password,
        };
        HttpService.updatePassword(passwordData);
      }}
    >
      {({ handleSubmit, errors, touched }) => (
        <Stack w="100%" p={4}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl
                isRequired
                isInvalid={!!errors.old_password && touched.old_password}
              >
                <FormLabel htmlFor="old_password">Old password</FormLabel>
                <InputGroup>
                  <Field
                    as={Input}
                    id="old_password"
                    name="old_password"
                    variant="outline"
                    type={showOldPassword ? "text" : "password"}
                  />
                  <InputRightElement h={"full"}>
                    <Button
                      variant={"ghost"}
                      onClick={() =>
                        setShowOldPassword(
                          (showOldPassword) => !showOldPassword
                        )
                      }
                    >
                      {showOldPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <SharedStyles.ErrorMessage>
                  {errors.old_password}
                </SharedStyles.ErrorMessage>
              </FormControl>
              <FormControl
                isRequired
                isInvalid={!!errors.new_password && touched.new_password}
              >
                <FormLabel htmlFor="new_password">New password</FormLabel>
                <InputGroup>
                  <Field
                    as={Input}
                    id="new_password"
                    name="new_password"
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
                  {errors.new_password}
                </SharedStyles.ErrorMessage>
              </FormControl>
              <FormControl
                isRequired
                isInvalid={
                  !!errors.repeated_password && touched.repeated_password
                }
              >
                <FormLabel htmlFor="repeated_password">
                  Repeat password
                </FormLabel>
                <InputGroup>
                  <Field
                    as={Input}
                    id="repeated_password"
                    name="repeated_password"
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
                  {errors.repeated_password}
                </SharedStyles.ErrorMessage>
              </FormControl>
              <Button mt={4} colorScheme="orange" type="submit">
                Change password
              </Button>
            </Stack>
          </form>
        </Stack>
      )}
    </Formik>
  );
};

export default PasswordForm;
