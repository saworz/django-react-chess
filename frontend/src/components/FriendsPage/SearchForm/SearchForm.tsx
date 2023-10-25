import {
  FormControl,
  Input,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import * as Types from "./SearchForm.types";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../app/store";
import { setSearchInput } from "../../../features/friendSystem/friendSystemSlice";

const SearchForm = ({ inputValue, setInputValue }: Types.IProps) => {
  const dispatch: AppDispatch = useDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    dispatch(setSearchInput(event.target.value));
  };

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
            onChange={handleChange}
          />
        </InputGroup>
      </FormControl>
    </form>
  );
};

export default SearchForm;
