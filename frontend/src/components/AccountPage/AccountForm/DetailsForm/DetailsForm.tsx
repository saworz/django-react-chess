import {
  Avatar,
  AvatarBadge,
  Button,
  Center,
  FormControl,
  FormLabel,
  Input,
  Stack,
  IconButton,
} from "@chakra-ui/react";
import { Formik, Field } from "formik";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import * as SharedStyles from "../../../../shared/styles";
import { AppDispatch, RootState } from "../../../../app/store";
import { useFilePicker } from "use-file-picker";
import { useState } from "react";
import HttpService from "../../../../utils/HttpService";
import { updateLoggedUser } from "../../../../features/auth/authSlice";

const AccountDetailsSchema = Yup.object().shape({
  username: Yup.string()
    .min(4, "Too Short! It must contain at least 4 characters")
    .max(16, "Too Long! It must contain at most 16 characters")
    .required("'Login' field is required"),

  email: Yup.string()
    .email("Invalid email")
    .required("'Email' field is required"),
});

const DEFAULT_IMAGE = "http://localhost:8000/media/default.jpg";

const DetailsForm = () => {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [imageBlob, setImageBlob] = useState(user?.image);
  const [image, setImage] = useState<File>();

  const { openFilePicker, filesContent } = useFilePicker({
    readAs: "DataURL",
    accept: "image/*",
    multiple: false,
    limitFilesConfig: { max: 2 },
    // minFileSize: 1,
    maxFileSize: 50, // in megabytes
    onFilesSuccessfullySelected: ({ plainFiles, filesContent }) => {
      setIsImageSelected(true);
      setImageBlob(filesContent[0].content);
      setImage(plainFiles[0]);
    },
  });

  const handleRemoveIcon = () => {
    //setIsImageSelected(false);
    //setImageBlob(DEFAULT_IMAGE);
  };

  const handleSubmit = (
    values: {
      username: string | undefined;
      email: string | undefined;
    },
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append("image", image!);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    user!.email === values.email
      ? null
      : formData.append("email", values.email!);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    user!.username === values.username
      ? null
      : formData.append("username", values.username!);
    HttpService.updateProfile(formData)
      .then((response) => {
        dispatch(updateLoggedUser(response));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Formik
      initialValues={{
        username: user?.username,
        email: user?.email,
      }}
      validationSchema={AccountDetailsSchema}
      onSubmit={(values, { setSubmitting }) => {
        handleSubmit(values, setSubmitting);
      }}
    >
      {({ handleSubmit, errors, touched, isSubmitting }) => (
        <Stack w="100%" p={4}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="image">
                <FormLabel>User Icon</FormLabel>
                <Stack direction={["column", "row"]} spacing={6}>
                  <Center>
                    {isImageSelected ? (
                      filesContent.map((file, index) => (
                        <Avatar key={index} size="xl" src={file.content}>
                          {imageBlob === DEFAULT_IMAGE ? null : (
                            <AvatarBadge
                              as={IconButton}
                              size="sm"
                              rounded="full"
                              top="-10px"
                              colorScheme="pink"
                              aria-label="remove Image"
                              onClick={handleRemoveIcon}
                              icon={<SmallCloseIcon />}
                            />
                          )}
                        </Avatar>
                      ))
                    ) : (
                      <Avatar size="xl" src={user?.image}>
                        {imageBlob === DEFAULT_IMAGE ? null : (
                          <AvatarBadge
                            as={IconButton}
                            size="sm"
                            rounded="full"
                            top="-10px"
                            colorScheme="pink"
                            aria-label="remove Image"
                            onClick={handleRemoveIcon}
                            icon={<SmallCloseIcon />}
                          />
                        )}
                      </Avatar>
                    )}
                  </Center>
                  <Center w="full">
                    <Button onClick={() => openFilePicker()} w="full">
                      Change Icon
                    </Button>
                  </Center>
                </Stack>
              </FormControl>
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
                isInvalid={!!errors.email && touched.email}
              >
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
              <Button
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
                mt={4}
                colorScheme="orange"
                type="submit"
              >
                Change details
              </Button>
            </Stack>
          </form>
        </Stack>
      )}
    </Formik>
  );
};

export default DetailsForm;
