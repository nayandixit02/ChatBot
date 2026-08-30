import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type ThemeMode = "dark" | "light";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  toggleTheme: () => {},
  isDark: true,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("app_theme");
    return (saved === "light" || saved === "dark") ? saved : "dark";
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("app_theme", next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    if (mode === "dark") {
      document.body.style.backgroundColor = "#060d17";
      document.body.style.color = "#f8fafc";
    } else {
      document.body.style.backgroundColor = "#f1f5f9";
      document.body.style.color = "#0f172a";
    }
  }, [mode]);

  const theme = useMemo(() => {
    const isDark = mode === "dark";
    return createTheme({
      palette: {
        mode,
        primary: {
          main: isDark ? "#00fffc" : "#0284c7",
          light: isDark ? "#5ffffd" : "#38bdf8",
          dark: isDark ? "#00b3b1" : "#0369a1",
        },
        secondary: {
          main: isDark ? "#6366f1" : "#4f46e5",
        },
        background: {
          default: isDark ? "#060d17" : "#f1f5f9",
          paper: isDark ? "#0e1826" : "#ffffff",
        },
        text: {
          primary: isDark ? "#f8fafc" : "#0f172a",
          secondary: isDark ? "#94a3b8" : "#475569",
        },
      },
      typography: {
        fontFamily: "'Roboto Slab', 'Work Sans', sans-serif",
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              borderRadius: 10,
              fontWeight: 600,
            },
          },
        },
      },
    });
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
      isDark: mode === "dark",
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
