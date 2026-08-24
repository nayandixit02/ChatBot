import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useThemeMode } from "../../context/ThemeContext";

const Footer = () => {
  const { isDark } = useThemeMode();

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        py: 4,
        mt: "auto",
        textAlign: "center",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: "14px", sm: "16px" },
          color: isDark ? "#94a3b8" : "#64748b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.8,
        }}
      >
        Crafted with care by
        <Link
          to="https://github.com/nayandixit02"
          target="_blank"
          rel="noreferrer"
          style={{
            color: isDark ? "#00fffc" : "#0284c7",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Nayan Dixit
        </Link>
        ✨
      </Typography>
    </Box>
  );
};

export default Footer;
