import * as SharedTypes from "../shared/types";

const getAccessToken = () => {
  const userData = localStorage.getItem("token");
  if (typeof userData === "string" && userData !== "") {
    const user: SharedTypes.TokenData = JSON.parse(userData);
    if (user && user.accessToken) {
      return "Bearer " + user.accessToken;
    }
  }
  return "";
};

const getRefreshToken = () => {
  const userData = localStorage.getItem("token");
  if (typeof userData === "string" && userData !== "") {
    const user: SharedTypes.TokenData = JSON.parse(userData);
    if (user && user.refreshToken) {
      return user.refreshToken;
    }
  }
  return "";
};

const updateAccessToken = (token: string) => {
  const user: SharedTypes.TokenData = JSON.parse(
    localStorage.getItem("token") || "{}"
  );
  user.accessToken = token;
  localStorage.setItem("token", JSON.stringify(user));
};

const isUserLogged = () => {
  const userData = localStorage.getItem("user");
  const tokenData = localStorage.getItem("token");
  if (
    typeof userData === "string" &&
    userData !== "" &&
    typeof tokenData === "string" &&
    tokenData !== ""
  ) {
    const user: SharedTypes.IUserData = JSON.parse(userData);
    const token: SharedTypes.TokenData = JSON.parse(tokenData);

    if (token && token.refreshToken && token.accessToken && user) {
      return true;
    }
  }
  return false;
};

const TokenService = {
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
  isUserLogged,
};
export default TokenService;
