import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Text } from "@chakra-ui/react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isError, message } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isError) {
      console.log(message);
    }

    if (!user) {
      navigate("/login");
    }
  }, [user, navigate, isError, message]);

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"center"}
      flex={1}
      direction="column"
    >
      <Text fontSize={"4rem"} fontWeight="black">
        Dashboard
      </Text>
    </Flex>
  );
};

export default DashboardPage;
