export interface IAuthState {
  user: IUserData;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

export interface IRegisterUserData {
  login: string;
  email: string;
  password: string;
  passwordRepeat: string;
}

export interface ILoginUserData {
  email: string;
  password: string;
}

export interface IUserData {
  _id: string;
  login: string;
  email: string;
  token: string;
}
