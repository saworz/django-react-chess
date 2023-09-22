import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import TokenService from "../app/tokenService";
import Navigation from "../components/Navigation";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Flex direction="column" minH="100vh">
      {TokenService.isUserLogged() && user ? (
        <Navigation />
      ) : (
        <Flex ml={"auto"} p={"10px"}>
          <ColorModeSwitcher />
        </Flex>
      )}
      {children}
    </Flex>
  );
};

export default Layout;
