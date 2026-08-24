import { post, get } from "./api.js";

const USER_KEY = "voicecart_user";

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export async function loginUser({ email, password }) {
  const user = await post("/auth/login", { email, password });
  setStoredUser(user);
  return user;
}

export async function signupUser({ name, email, password }) {
  const user = await post("/auth/signup", { name, email, password });
  setStoredUser(user);
  return user;
}

export async function googleAuthUser({ idToken, name, email }) {
  const user = await post("/auth/google", { idToken, name, email });
  setStoredUser(user);
  return user;
}

export function logoutUser() {
  setStoredUser(null);
}

export async function requestForgotPassword(email) {
  return post("/auth/forgot-password", { email });
}

export async function resetPassword({ email, otp, newPassword }) {
  const user = await post("/auth/reset-password", { email, otp, newPassword });
  setStoredUser(user);
  return user;
}
