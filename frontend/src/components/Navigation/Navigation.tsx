import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Text,
  theme,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { NavLink } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";
import { ReactComponent as PawnLogo } from "../../images/logo_pawn.svg";
import { toast } from "react-toastify";

const Links = [
  {
    name: "Dashboard",
    destination: "/dashboard",
  },
  { name: "Friends", destination: "/friends" },
  { name: "Leaderboard", destination: "/leaderboard" },
];

const Navigation = () => {
  const mainColor = useColorModeValue(theme.colors.black, theme.colors.white);
  const { user } = useSelector((state: RootState) => state.auth);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch: AppDispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout()).then((response) => {
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
  };

  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          size={"md"}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={"center"}>
          <Box>
            <HStack>
              <Text display={{ base: "none", sm: "block" }} fontWeight="black">
                Chess Game
              </Text>
              <PawnLogo style={{ stroke: `${mainColor}` }} />
            </HStack>
          </Box>
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            <NavLink to="/play">PLAY</NavLink>
            <Text>|</Text>
            {Links.map((link) => (
              <NavLink to={link.destination} key={link.name}>
                {link.name}
              </NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems={"center"}>
          <Menu>
            <MenuButton
              as={Button}
              rounded={"full"}
              variant={"link"}
              cursor={"pointer"}
              minW={0}
            >
              <Avatar size={"sm"} src={user?.image} />
            </MenuButton>
            <MenuList>
              <MenuItem>
                <NavLink to="/account">Account settings</NavLink>
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as={"nav"} spacing={4}>
            {Links.map((link) => (
              <NavLink to={link.destination} key={link.name}>
                {link.name}
              </NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default Navigation;
