import { Flex, Input, Button } from "@chakra-ui/react";
import * as Types from "./ChatFooter.types";

const ChatFooter = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
}: Types.IProps) => {
  return (
    <Flex w="100%" mt="5" borderTop="1px solid black" paddingTop={3}>
      <Input
        placeholder="Type Something..."
        border="none"
        borderRadius="none"
        _focus={{
          border: "1px solid black",
        }}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleSendMessage();
          }
        }}
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
      />
      <Button
        bg="black"
        color="white"
        borderRadius="none"
        _hover={{
          bg: "white",
          color: "black",
          border: "1px solid black",
        }}
        disabled={inputMessage.trim().length <= 0}
        onClick={handleSendMessage}
      >
        Send
      </Button>
    </Flex>
  );
};

export default ChatFooter;
