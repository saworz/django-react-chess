import CancelRequestButton from "../SuggestionsRowButtons/CancelRequestButton";
import * as Types from "./SentRequestsButtons.types";

const SentRequestsButtons = ({ userId }: Types.IButtonProps) => {
  return <CancelRequestButton userId={userId} />;
};

export default SentRequestsButtons;
