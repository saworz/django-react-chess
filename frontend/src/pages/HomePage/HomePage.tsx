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

type Props = {};

const HomePage = (props: Props) => {
  const mainColor = useColorModeValue(theme.colors.black, theme.colors.white);

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
            <Button colorScheme="orange" variant="solid">
              Login
            </Button>
            <Button colorScheme="orange" variant="outline">
              Register
            </Button>
          </HStack>
        </Center>
      </ScaleFade>
    </Flex>
  );
};

export default HomePage;
