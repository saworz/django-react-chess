import { Box, Button, Spinner, Text } from "@chakra-ui/react";
import HttpService from "../../../utils/HttpService";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { toast } from "react-toastify";
import * as Types from "./SearchInfo.types";

const SearchInfo = ({ setIsSearchingGame, isSearchingGame }: Types.IProps) => {
  const webSocketRef = useRef<W3CWebSocket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const [webSocket, setWebSocket] = useState<W3CWebSocket>();

  const connectWebSocket = () => {
    const clientWebSocket = new W3CWebSocket(
      `ws://localhost:8000/ws/queue/${user?.id}`
    );

    webSocketRef.current = clientWebSocket;

    clientWebSocket.onopen = () => {
      console.log("WebSocket Queue - connected");
      toast.info(`Looking for the game...`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    };

    clientWebSocket.onerror = () => {};

    clientWebSocket.onclose = () => {
      console.log("WebSocket Queue - closed successfully");
    };

    clientWebSocket.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data.toString());
      console.log("got reply! ");
      if (dataFromServer.type === "error") {
      }
    };
    setWebSocket(clientWebSocket);
  };

  useEffect(() => {
    connectWebSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    HttpService.removeUserFromQueue()
      .then((response) => {
        if (response?.status === 200) {
          setIsSearchingGame(false);
          webSocket?.close();
          toast.info(`No longer searching for the game...`, {
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
      })
      .catch((error) => {
        const response = error.response;
        if (
          response.data.message === "User is not in queue" &&
          response.status === 400
        ) {
          setIsSearchingGame(false);
        }
      });
  };

  return (
    <Box display="flex" justifyContent="center" flexDirection="column">
      <Text fontSize={"2rem"} fontWeight="black">
        Searching game...
      </Text>
      <Spinner
        thickness="4px"
        speed="0.4s"
        emptyColor="gray.200"
        color="orange"
        size="xl"
        alignSelf="center"
        m={3}
      />
      <Button onClick={handleClick}>STOP</Button>
    </Box>
  );
};

export default SearchInfo;
