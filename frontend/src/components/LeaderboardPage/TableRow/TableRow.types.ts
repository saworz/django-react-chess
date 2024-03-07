export interface IProps {
  userScoreDetails: {
    id: number;
    username: string;
    email: string;
    image: string;
    wins: number;
    losses: number;
    elo: number;
    is_friend: boolean;
    pending_request: boolean;
    request_sender_id: number;
  };
  position: number;
}
