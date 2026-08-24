import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Logo from "./shared/Logo";
import { useAuth } from "../context/useAuth";
import { useThemeMode } from "../context/ThemeContext";
import NavigationLink from "./shared/NavigationLink";
import { BsSunFill, BsMoonStarsFill } from "react-icons/bs";

const Header = () => {
  const auth = useAuth();
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <AppBar
      sx={{
        bgcolor: isDark ? "rgba(6, 13, 23, 0.85)" : "rgba(241, 245, 249, 0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 1100,
        boxShadow: isDark
          ? "0 1px 0 rgba(255, 255, 255, 0.08)"
          : "0 1px 0 rgba(0, 0, 0, 0.08)",
        transition: "all 0.3s ease",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 1.5, sm: 3 },
          py: 0.5,
        }}
      >
        <Logo />

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 } }}>
          {/* Theme Toggle Button */}
          <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                p: 1.2,
                borderRadius: "12px",
                bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
                border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)"}`,
                color: isDark ? "#facc15" : "#0284c7",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  bgcolor: isDark ? "rgba(250, 204, 21, 0.15)" : "rgba(2, 132, 199, 0.12)",
                  transform: "rotate(15deg) scale(1.05)",
                },
              }}
            >
              {isDark ? <BsSunFill size={18} /> : <BsMoonStarsFill size={18} />}
            </IconButton>
          </Tooltip>

          {auth?.isLoggedIn ? (
            <>
              <NavigationLink
                bg={isDark ? "#00fffc" : "#0284c7"}
                to="/chat"
                text="Go To Chat"
                textColor={isDark ? "black" : "white"}
              />
              <NavigationLink
                bg={isDark ? "#51538f" : "#475569"}
                textColor="white"
                to="/"
                text="Logout"
                onClick={auth.logout}
              />
            </>
          ) : (
            <>
              <NavigationLink
                bg={isDark ? "#00fffc" : "#0284c7"}
                to="/login"
                text="Login"
                textColor={isDark ? "black" : "white"}
              />
              <NavigationLink
                bg={isDark ? "#51538f" : "#475569"}
                textColor="white"
                to="/signup"
                text="Signup"
              />
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
