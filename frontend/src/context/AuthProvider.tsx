import { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import {
  checkAuthStatus,
  loginUser,
  logoutUser,
  signupUser,
} from "../helpers/api-communicator";
import { AuthContext, User, UserAuth } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        }
        const data = await checkAuthStatus();
        if (data && data.email) {
          setUser({ email: data.email, name: data.name });
          setIsLoggedIn(true);
        } else {
          // No valid session
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Auth check failed:", err.message);
        } else {
          console.error("Auth check failed with unknown error", err);
        }
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password);
    if (data) {
      if (data.token) {
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      setUser({ email: data.email, name: data.name });
      setIsLoggedIn(true);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const data = await signupUser(name, email, password);
    if (data) {
      if (data.token) {
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      setUser({ email: data.email, name: data.name });
      setIsLoggedIn(true);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error("Logout error:", e);
    }
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setIsLoggedIn(false);
  };

  const value: UserAuth = {
    user,
    isLoggedIn,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
