import AcceptFriendButton from "../SuggestionsRowButtons/AcceptFriendButton";
import DeclineFriendButton from "../SuggestionsRowButtons/DeclineFriendButton";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import * as Types from "./PendingRequestsButtons.types";

const PendingRequestsButtons = ({
  userId,
  userDetails,
}: Types.IButtonProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (userDetails!.is_friend === true) {
    return null;
  } else {
    if (
      userDetails?.pending_request === true &&
      userDetails.request_sender !== user?.id
    ) {
      return (
        <>
          <AcceptFriendButton userId={userId} />
          <DeclineFriendButton userId={userId} />
        </>
      );
    } else {
      return null;
    }
  }
};

export default PendingRequestsButtons;
