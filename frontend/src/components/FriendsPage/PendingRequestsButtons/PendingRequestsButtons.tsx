import AcceptFriendButton from "../SuggestionsRowButtons/AcceptFriendButton";
import DeclineFriendButton from "../SuggestionsRowButtons/DeclineFriendButton";
import * as Types from "./PendingRequestsButtons.types";

const PendingRequestsButtons = ({ userId }: Types.IButtonProps) => {
  return (
    <>
      <AcceptFriendButton userId={userId} />
      <DeclineFriendButton userId={userId} />
    </>
  );
};

export default PendingRequestsButtons;
