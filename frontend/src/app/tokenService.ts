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

const getCsrfToken = () => {
  const allCookies = document.cookie;

  const cookiesArray = allCookies.split(";");
  for (const cookie of cookiesArray) {
    const [name, value] = cookie.trim().split("=");

    if (name === "csrftoken") {
      return value;
    }
  }
};

const clearCookies = () => {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }
};

const TokenService = {
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
  getCsrfToken,
  clearCookies,
  isUserLogged,
};
export default TokenService;
