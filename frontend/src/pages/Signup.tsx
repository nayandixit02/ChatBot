import React, { useEffect } from "react";
import { IoIosLogIn } from "react-icons/io";
import { Box, Typography, Button } from "@mui/material";
import CustomizedInput from "../components/shared/CustomizedInput";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/useAuth";
import { useThemeMode } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { getErrorMessage } from "../helpers/api-communicator";

const Signup = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { isDark } = useThemeMode();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const password = (formData.get("password") as string)?.trim();

    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      toast.loading("Creating Account...", { id: "signup" });
      await auth?.signup(name, email, password);
      toast.success("Account Created Successfully", { id: "signup" });
      navigate("/chat");
    } catch (error) {
      console.error("Signup error:", error);
      const msg = getErrorMessage(error, "Account Creation Failed");
      toast.error(msg, { id: "signup" });
    }
  };

  useEffect(() => {
    if (auth?.isLoggedIn && auth?.user) {
      navigate("/chat");
    }
  }, [auth?.isLoggedIn, auth?.user, navigate]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          maxWidth: "1000px",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {/* Robot Visual for Desktop */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flex: 1,
            justifyContent: "center",
          }}
        >
          <img
            src="/airobot.png"
            alt="Robot"
            style={{
              width: "100%",
              maxWidth: "380px",
              filter: isDark
                ? "drop-shadow(0 0 30px rgba(0, 255, 252, 0.25))"
                : "drop-shadow(0 8px 24px rgba(0, 0, 0, 0.12))",
            }}
          />
        </Box>

        {/* Signup Card */}
        <Box
          sx={{
            flex: 1,
            maxWidth: "460px",
            width: "100%",
            p: { xs: 3, sm: 4 },
            bgcolor: isDark ? "rgba(13, 25, 41, 0.85)" : "#ffffff",
            backdropFilter: "blur(12px)",
            borderRadius: "20px",
            border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"}`,
            boxShadow: isDark
              ? "0 10px 40px rgba(0, 0, 0, 0.4)"
              : "0 10px 30px rgba(0, 0, 0, 0.06)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  color: isDark ? "#f8fafc" : "#0f172a",
                }}
              >
                Get Started
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: isDark ? "#94a3b8" : "#64748b",
                  mb: 3,
                }}
              >
                Create your account to start chatting with Gemini
              </Typography>

              <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
                <CustomizedInput type="text" name="name" label="Full Name" />
                <CustomizedInput type="email" name="email" label="Email Address" />
                <CustomizedInput type="password" name="password" label="Password" />
              </Box>

              <Button
                type="submit"
                sx={{
                  mt: 3,
                  py: 1.3,
                  width: "100%",
                  borderRadius: "12px",
                  bgcolor: isDark ? "#00fffc" : "#0284c7",
                  color: isDark ? "#000000" : "#ffffff",
                  fontWeight: 700,
                  fontSize: "16px",
                  boxShadow: isDark
                    ? "0 4px 16px rgba(0, 255, 252, 0.25)"
                    : "0 4px 16px rgba(2, 132, 199, 0.25)",
                  "&:hover": {
                    bgcolor: isDark ? "#5ffffd" : "#0369a1",
                    transform: "translateY(-1px)",
                  },
                }}
                endIcon={<IoIosLogIn size={20} />}
              >
                Create Account
              </Button>

              <Typography
                sx={{
                  mt: 3,
                  fontSize: "14px",
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: isDark ? "#00fffc" : "#0284c7",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  Log In
                </Link>
              </Typography>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;
