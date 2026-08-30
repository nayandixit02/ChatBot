import { create } from "zustand";
import axios from "axios";
import {
  checkAuthStatus,
  loginUser,
  logoutUser,
  signupUser,
} from "../helpers/api-communicator";

export type User = {
  name: string;
  email: string;
};

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  loading: true,
  error: null,

  checkAuth: async () => {
    try {
      set({ loading: true, error: null });
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
      const data = await checkAuthStatus();
      if (data && data.email) {
        set({
          user: { email: data.email, name: data.name },
          isLoggedIn: true,
          loading: false,
          error: null,
        });
      } else {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        set({ user: null, isLoggedIn: false, loading: false, error: null });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Auth check failed:", err.message);
      }
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      set({ user: null, isLoggedIn: false, loading: false, error: null });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const data = await loginUser(email, password);
      if (data) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        }
        set({
          user: { email: data.email, name: data.name },
          isLoggedIn: true,
          loading: false,
          error: null,
        });
      }
    } catch (error: unknown) {
      set({ loading: false });
      throw error;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const data = await signupUser(name, email, password);
      if (data) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        }
        set({
          user: { email: data.email, name: data.name },
          isLoggedIn: true,
          loading: false,
          error: null,
        });
      }
    } catch (error: unknown) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await logoutUser();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      set({ user: null, isLoggedIn: false, loading: false, error: null });
    }
  },
}));
