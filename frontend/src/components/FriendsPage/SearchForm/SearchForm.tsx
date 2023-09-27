import {
  FormControl,
  Input,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import * as Types from "./SearchForm.types";

const SearchForm = ({ inputValue, setInputValue }: Types.IProps) => {
  return (
    <form>
      <FormControl>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Search2Icon color="gray.300" />
          </InputLeftElement>
          <Input
            bg={useColorModeValue("white", "gray.600")}
            variant="outline"
            placeholder="Search by username"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </InputGroup>
      </FormControl>
    </form>
  );
};

export default SearchForm;
