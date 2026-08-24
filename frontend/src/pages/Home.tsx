import { Box, useMediaQuery, useTheme } from "@mui/material";
import TypingAnim from "../components/typer/TypingAnim";
import Footer from "../components/footer/Footer";
import { useThemeMode } from "../context/ThemeContext";

const Home = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { isDark } = useThemeMode();

  return (
    <Box
      width={"100%"}
      minHeight={"100%"}
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: isDark ? "#060d17" : "#f8fafc",
        color: isDark ? "#f8fafc" : "#0f172a",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          mx: "auto",
          mt: { xs: 4, md: 6 },
          px: 2,
        }}
      >
        <Box sx={{ textAlign: "center", minHeight: "80px" }}>
          <TypingAnim />
        </Box>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: { md: "row", xs: "column" },
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 4, md: 8 },
            my: { xs: 6, md: 8 },
          }}
        >
          <img
            src="/robot.png"
            alt="robot"
            style={{
              width: "180px",
              height: "auto",
              filter: isDark
                ? "drop-shadow(0 0 20px rgba(0, 255, 252, 0.3))"
                : "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
            }}
          />
          <img
            className="rotate"
            src="/gemini.png"
            alt="gemini"
            style={{
              width: "180px",
              height: "auto",
              filter: isDark
                ? "drop-shadow(0 0 25px rgba(56, 189, 248, 0.4))"
                : "drop-shadow(0 4px 12px rgba(2, 132, 199, 0.2))",
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            mx: "auto",
            justifyContent: "center",
            width: "100%",
            my: 3,
          }}
        >
          <img
            src="/gemin_chat.png"
            alt="chatbot"
            style={{
              display: "flex",
              margin: "auto",
              width: isBelowMd ? "90%" : "65%",
              maxWidth: "850px",
              borderRadius: "24px",
              border: `1px solid ${isDark ? "rgba(0, 255, 252, 0.2)" : "rgba(0, 0, 0, 0.1)"}`,
              boxShadow: isDark
                ? "0 0 50px rgba(0, 255, 252, 0.2)"
                : "0 10px 40px rgba(0, 0, 0, 0.08)",
              padding: "10px",
              backgroundColor: isDark ? "rgba(13, 25, 41, 0.6)" : "#ffffff",
            }}
          />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Home;
