import { Button } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import TokenService from "../../../../app/tokenService";
import axios from "axios";
import * as Types from "./../SuggestionsRowButtons.types";
import { AppDispatch, RootState } from "../../../../app/store";
import { toast } from "react-toastify";
import { getSuggestionsList } from "../../../../features/friendSystem/friendSystemSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/api/friends";

const AddFriendButton = ({ userId }: Types.IButtonProps) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { friendSystem } = useSelector(
    (state: RootState) => state.friendSystem
  );

  const performButtonAction = async () => {
    try {
      const response = await axios.post(
        API_URL + `/send_request/${userId}/`,
        {},
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
        dispatch(getSuggestionsList(friendSystem.searchInput));
        navigate("/");
      }
    } catch (error) {
      // Obsłuż błąd, jeśli wystąpi
      console.error(error);
    }
  };

  return (
    <Button
      onClick={performButtonAction}
      leftIcon={<AddIcon />}
      colorScheme="whatsapp"
      variant="solid"
    >
      Add friend
    </Button>
  );
};

export default AddFriendButton;
