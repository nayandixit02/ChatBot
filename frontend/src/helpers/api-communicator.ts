import axios from "axios";

export const getErrorMessage = (error: unknown, defaultMsg: string): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      if (typeof error.response.data === "string") {
        return error.response.data;
      }
      if (typeof error.response.data === "object") {
        const data = error.response.data as any;
        if (data.message) {
          return data.message;
        }
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          return data.errors.map((e: any) => e.msg || e.message).join(", ");
        }
      }
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return defaultMsg;
};

export const loginUser = async (email: string, password: string) => {
  const res = await axios.post(
    "/user/login",
    { email, password },
    { withCredentials: true }
  );
  if (res.status !== 200) {
    throw new Error("Unable to login");
  }
  return res.data;
};

export const signupUser = async (
  name: string,
  email: string,
  password: string
) => {
  const res = await axios.post(
    "/user/signup",
    { name, email, password },
    { withCredentials: true }
  );
  if (res.status !== 201 && res.status !== 200) {
    throw new Error("Unable to Signup");
  }
  return res.data;
};

export const checkAuthStatus = async () => {
  try {
    const res = await axios.get("/user/auth-status", { withCredentials: true });
    if (res.status !== 200) throw new Error("Unable to authenticate");
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return null;
      }
    }
    throw error;
  }
};

export const sendChatRequest = async (message: string) => {
  const res = await axios.post(
    "/chat/new",
    { message },
    { withCredentials: true }
  );
  if (res.status !== 200) {
    throw new Error("Unable to send chat");
  }
  return res.data;
};

export const getUserChats = async () => {
  const res = await axios.get("/user/chats", { withCredentials: true });
  if (res.status !== 200) {
    throw new Error("Unable to get chats");
  }
  return res.data;
};

export const deleteUserChats = async () => {
  const res = await axios.delete("/chat/delete", { withCredentials: true });
  if (res.status !== 200) {
    throw new Error("Unable to delete chats");
  }
  return res.data;
};

export const logoutUser = async () => {
  try {
    const res = await axios.get("/user/logout", { withCredentials: true });
    return res.data;
  } catch {
    return null;
  }
};
