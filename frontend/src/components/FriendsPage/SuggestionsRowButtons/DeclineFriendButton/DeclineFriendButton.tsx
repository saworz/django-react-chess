import { Button } from "@chakra-ui/button";
import { CloseIcon } from "@chakra-ui/icons";
import TokenService from "../../../../app/tokenService";
import axios from "axios";
import * as Types from "./../SuggestionsRowButtons.types";
import { AppDispatch } from "../../../../app/store";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getPendingRequests } from "../../../../features/friendSystem/friendSystemSlice";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/api/friends";

const DeclineFriendButton = ({ userId }: Types.IButtonProps) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

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
        dispatch(getPendingRequests());
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
      leftIcon={<CloseIcon />}
      colorScheme="pink"
      variant="solid"
    >
      Decline
    </Button>
  );
};

export default DeclineFriendButton;
