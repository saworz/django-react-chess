import { Button } from "@chakra-ui/button";
import { DeleteIcon } from "@chakra-ui/icons";
import TokenService from "../../../../app/tokenService";
import axios from "axios";
import { toast } from "react-toastify";
import * as Types from "./../SuggestionsRowButtons.types";
import { AppDispatch } from "../../../../app/store";
import { useDispatch } from "react-redux";
import { getFriendsList } from "../../../../features/friendSystem/friendSystemSlice";

const API_URL = "http://localhost:8000/api/friends";

const RemoveFriendButton = ({ userId }: Types.IButtonProps) => {
  const dispatch: AppDispatch = useDispatch();

  const performButtonAction = async () => {
    try {
      const response = await axios.delete(
        API_URL + `/remove_friend/${userId}/`,
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": TokenService.getCsrfToken(),
          },
        }
      );
      if (response.status === 200) {
        toast.success(`${response.data.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        dispatch(getFriendsList());
      }
    } catch (error) {
      // Obsłuż błąd, jeśli wystąpi
      console.error(error);
    }
  };

  return (
    <Button
      onClick={performButtonAction}
      leftIcon={<DeleteIcon />}
      colorScheme="pink"
      variant="solid"
    >
      Remove friend
    </Button>
  );
};

export default RemoveFriendButton;
