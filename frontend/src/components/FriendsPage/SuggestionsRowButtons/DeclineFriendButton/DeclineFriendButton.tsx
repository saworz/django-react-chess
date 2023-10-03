import { Button } from "@chakra-ui/button";
import { CloseIcon } from "@chakra-ui/icons";
import TokenService from "../../../../app/tokenService";
import axios from "axios";
import * as Types from "./../SuggestionsRowButtons.types";
import { AppDispatch, RootState } from "../../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getSuggestionsList } from "../../../../features/friendSystem/friendSystemSlice";
import { setPendingRequests } from "../../../../features/friendSystem/friendSystemSlice";

const API_URL = "http://localhost:8000/api/friends";

const DeclineFriendButton = ({ userId }: Types.IButtonProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { friendSystem } = useSelector(
    (state: RootState) => state.friendSystem
  );

  const performButtonAction = async () => {
    try {
      const response = await axios.delete(
        API_URL + `/decline_request/${userId}/`,
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
        dispatch(getSuggestionsList(friendSystem.searchInput)).then(() => {
          dispatch(
            setPendingRequests(
              friendSystem.suggestionsList.filter(
                (item) =>
                  item.is_friend === false &&
                  item.request_sender_id !== user?.id &&
                  item.pending_request === true
              )
            )
          );
        });
      }
    } catch (error) {
      // Obsłuż błąd, jeśli wystąpi
      console.error(error);
    }
  };

  return (
    <Button
      onClick={performButtonAction}
      leftIcon={<CloseIcon />}
      colorScheme="pink"
      variant="solid"
    >
      Decline request
    </Button>
  );
};

export default DeclineFriendButton;
