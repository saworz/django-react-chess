import { Button } from "@chakra-ui/button";
import { CheckIcon } from "@chakra-ui/icons";
import TokenService from "../../../../app/tokenService";
import axios from "axios";
import * as Types from "./../SuggestionsRowButtons.types";
import { AppDispatch } from "../../../../app/store";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getPendingRequests } from "../../../../features/friendSystem/friendSystemSlice";

const API_URL = "http://localhost:8000/api/friends";

const AcceptFriendButton = ({ userId }: Types.IButtonProps) => {
  const dispatch: AppDispatch = useDispatch();

  const performButtonAction = async () => {
    try {
      const response = await axios.post(
        API_URL + `/accept_request/${userId}/`,
        {},
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": TokenService.getCsrfToken(),
            "Content-Type": "application/json", // Użyj odpowiedniego typu treści, jeśli to jest JSON
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
        dispatch(getPendingRequests());
      }
    } catch (error) {
      // Obsłuż błąd, jeśli wystąpi
      console.error(error);
    }
  };

  return (
    <Button
      onClick={performButtonAction}
      leftIcon={<CheckIcon />}
      colorScheme="whatsapp"
      variant="solid"
    >
      Accept request
    </Button>
  );
};

export default AcceptFriendButton;
