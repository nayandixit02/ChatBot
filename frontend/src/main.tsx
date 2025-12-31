import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createTheme, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.tsx";
import { Toaster } from "react-hot-toast";
import axios from "axios";
// Use relative API path so frontend calls the same origin backend (works on Render)
axios.defaults.baseURL = "/api/v1";
axios.defaults.withCredentials = true;

const theme = createTheme({
  typography: {
    fontFamily: "Roboto Slab, serif",
    allVariants: { color: "white" },
  },
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Toaster position="top-right" />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
