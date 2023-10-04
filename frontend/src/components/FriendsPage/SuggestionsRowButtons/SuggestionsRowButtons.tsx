import AddFriendButton from "./AddFriendButton";
import * as Types from "./SuggestionsRowButtons.types";

const SuggestionsRowButtons = ({ userId, userDetails }: Types.IButtonProps) => {
  if (userDetails!.is_friend === true) {
    return null;
  } else {
    if (
      userDetails?.pending_request === false &&
      userDetails.request_sender == null
    ) {
      return <AddFriendButton userId={userId} />;
    } else {
      return null;
    }
  }
};

export default SuggestionsRowButtons;
