import { Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { useThemeMode } from "../../context/ThemeContext";

function Logo() {
  const { isDark } = useThemeMode();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        textDecoration: "none",
      }}
    >
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        <img
          src="/chatbot.png"
          alt="chatbot"
          width="38px"
          height="38px"
          style={{
            objectFit: "contain",
            filter: isDark ? "drop-shadow(0 0 8px rgba(0,255,252,0.4))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
          }}
        />
      </Link>
      <Typography
        component={Link}
        to="/"
        sx={{
          display: { sm: "block", xs: "none" },
          fontWeight: "800",
          fontSize: "20px",
          letterSpacing: "0.5px",
          textDecoration: "none",
          color: isDark ? "#f8fafc" : "#0f172a",
          transition: "color 0.3s ease",
        }}
      >
        <Box
          component="span"
          sx={{
            background: isDark
              ? "linear-gradient(90deg, #00fffc, #38bdf8)"
              : "linear-gradient(90deg, #0284c7, #6366f1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 900,
          }}
        >
          MERN
        </Box>
        -CHAT
      </Typography>
    </Box>
  );
}

export default Logo;
