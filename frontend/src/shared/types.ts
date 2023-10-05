export interface IAuthState {
  user: IUserData | null;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

export interface IFriendSystemState {
  friendSystem: {
    suggestionsList: ISuggestionFriendData[];
    friendsList: IFriendData[];
    searchInput: string;
    pendingRequests: IPendingRequestsData[];
    sentRequests: ISuggestionFriendData[];
  };
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

export interface IRegisterUserData {
  username: string;
  email: string;
  password1: string;
  password2: string;
}

export interface ILoginUserData {
  username: string;
  password: string;
}

export interface IUserData {
  id: number;
  username: string;
  email: string;
  image_url: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface IUpdateUserData {
  username: string;
  email: string;
  image: string;
}

export interface ISuggestionFriendData {
  id: number;
  username: string;
  email: string;
  image: string;
  is_friend: boolean;
  pending_request: boolean;
  request_sender_id: number;
}

export interface IPendingRequestsData {
  id: number;
  username: string;
  email: string;
  image: string;
}

export interface IFriendData {
  id: number;
  username: string;
  email: string;
  image: string;
}
