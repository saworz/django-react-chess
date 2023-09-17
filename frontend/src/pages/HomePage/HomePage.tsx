import {
  Flex,
  ScaleFade,
  Text,
  HStack,
  Button,
  theme,
  useColorModeValue,
  Center,
} from "@chakra-ui/react";
import { ReactComponent as PawnImage } from "../../images/homepage_pawn.svg";
import { useNavigate } from "react-router-dom";

type Props = {};

const HomePage = (props: Props) => {
  const mainColor = useColorModeValue(theme.colors.black, theme.colors.white);
  const navigate = useNavigate();

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
        <Center flexDirection="column">
          <PawnImage style={{ stroke: `${mainColor}` }} />
          <Text fontSize={"4rem"} fontWeight="black">
            Chess Game
          </Text>
          <HStack justify="center">
            <Button
              onClick={() => navigate("/login")}
              colorScheme="orange"
              variant="solid"
            >
              Sign in
            </Button>
            <Button colorScheme="orange" variant="outline">
              Sign up
            </Button>
          </HStack>
        </Center>
      </ScaleFade>
    </Flex>
  );
};

export default HomePage;
