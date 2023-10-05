import { Stack } from "@chakra-ui/react";
import PasswordForm from "./PasswordForm";
import DetailsForm from "./DetailsForm";

const AccountForm = () => {
  return (
    <Stack justifyContent="space-between" direction="row">
      <DetailsForm />
      <PasswordForm />
    </Stack>
  );
};

export default AccountForm;
