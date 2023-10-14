import { useSelector } from "react-redux";
import AddFriendButton from "./AddFriendButton";
import { RootState } from "../../../app/store";
import CancelRequestButton from "./CancelRequestButton";
import * as Types from "./SuggestionsRowButtons.types";
import AcceptFriendButton from "./AcceptFriendButton";
import DeclineFriendButton from "./DeclineFriendButton";

const SuggestionsRowButtons = ({ userId, userDetails }: Types.IButtonProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (userDetails!.is_friend === true) {
    return null;
  } else {
    if (
      userDetails?.pending_request === false &&
      userDetails.request_sender_id == null
    ) {
      return <AddFriendButton userId={userId} />;
    } else if (
      userDetails?.pending_request === true &&
      userDetails.request_sender_id === user?.id
    ) {
      return <CancelRequestButton userId={userId} />;
    } else if (
      userDetails?.pending_request === true &&
      userDetails.request_sender_id === userId
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
