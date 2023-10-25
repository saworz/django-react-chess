export interface IButtonProps {
  userId: number;
  userDetails?: {
    is_friend: boolean;
    pending_request: boolean;
    request_sender_id: number;
  };
}
