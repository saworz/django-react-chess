import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Text } from "@chakra-ui/react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isError, message } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isError) {
      console.log(message);
    }
  }, [navigate, isError, message]);

  const handleClick = () => {
    // Odczytaj wszystkie ciasteczka
    const allCookies = document.cookie;

    // Przetwórz ciasteczka
    const cookiesArray = allCookies.split(";");
    const cookies = [];

    for (const cookie of cookiesArray) {
      const [name, value] = cookie.trim().split("=");
      cookies.push({ name, value: decodeURIComponent(value) });
    }

    console.log("Tablica", cookies);
  };

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
      <button onClick={handleClick}>TEST</button>
    </Flex>
  );
};

export default DashboardPage;
