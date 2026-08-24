import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.tsx";
import { CustomThemeProvider } from "./context/ThemeContext.tsx";
import { Toaster } from "react-hot-toast";
import axios from "axios";

// Normalize backend URL to ensure it points to /api/v1 properly
let rawBackendUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://chatbot-backend-9rf1.onrender.com/api/v1";

rawBackendUrl = rawBackendUrl.replace(/\/+$/, "");
if (!rawBackendUrl.endsWith("/api/v1")) {
  rawBackendUrl = `${rawBackendUrl}/api/v1`;
}

axios.defaults.baseURL = rawBackendUrl;
axios.defaults.withCredentials = true;

// Preload token if exists in storage
const storedToken = localStorage.getItem("token");
if (storedToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

// Request interceptor to automatically attach JWT to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CustomThemeProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <App />
        </BrowserRouter>
      </CustomThemeProvider>
    </AuthProvider>
  </StrictMode>
);
