import AddFriendButton from "./AddFriendButton";
import AcceptFriendButton from "./AcceptFriendButton";
import DeclineFriendButton from "./DeclineFriendButton";
import CancelRequestButton from "./CancelRequestButton";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import * as Types from "./SuggestionsRowButtons.types";

const SuggestionsRowButtons = ({ userId, userDetails }: Types.IButtonProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (userDetails!.is_friend === true) {
    return null;
  } else {
    if (
      userDetails?.pending_request === true &&
      userDetails.request_sender === user?.id
    ) {
      return <CancelRequestButton userId={userId} />;
    } else if (
      userDetails?.pending_request === false &&
      userDetails.request_sender == null
    ) {
      return <AddFriendButton userId={userId} />;
    } else if (
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

export default SuggestionsRowButtons;
