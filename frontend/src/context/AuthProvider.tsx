import { ReactNode, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
};
