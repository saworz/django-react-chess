import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import AddFriendButton from "../../FriendsPage/SuggestionsRowButtons/AddFriendButton";
import CancelRequestButton from "../../FriendsPage/SuggestionsRowButtons/CancelRequestButton";
import AcceptFriendButton from "../../FriendsPage/SuggestionsRowButtons/AcceptFriendButton";
import DeclineFriendButton from "../../FriendsPage/SuggestionsRowButtons/DeclineFriendButton";
import RemoveFriendButton from "../../FriendsPage/SuggestionsRowButtons/RemoveFriendButton";
import * as Types from "./UserDetailsButtons.types";
import { HStack } from "@chakra-ui/react";

const UserDetailsButtons = ({ userDetails }: Types.IProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (userDetails!.is_friend === true) {
    return <RemoveFriendButton userId={userDetails.id} />;
  } else {
    if (
      userDetails?.pending_request === false &&
      userDetails.request_sender_id == null
    ) {
      return <AddFriendButton userId={userDetails.id} />;
    } else if (
      userDetails?.pending_request === true &&
      userDetails.request_sender_id === user?.id
    ) {
      return <CancelRequestButton userId={userDetails.id} />;
    } else if (
      userDetails?.pending_request === true &&
      userDetails.request_sender_id === userDetails?.id
    ) {
      return (
        <HStack>
          <AcceptFriendButton userId={userDetails.id} />
          <DeclineFriendButton userId={userDetails.id} />
        </HStack>
      );
    } else {
      return null;
    }
  }
};

export default UserDetailsButtons;
