import React, { useState } from "react";
import { Box, Avatar, Typography, IconButton, Tooltip } from "@mui/material";
import { useAuth } from "../../context/useAuth";
import { useThemeMode } from "../../context/ThemeContext";
import MarkdownContent from "./MarkdownContent";
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";
import { RiRobot2Fill } from "react-icons/ri";

export const ChatItem = ({
  content,
  role,
}: {
  content: string;
  role: "user" | "assistant";
}) => {
  const auth = useAuth();
  const { isDark } = useThemeMode();
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const userInitial1 = auth?.user?.name?.[0]?.toUpperCase() || "U";
  const userInitial2 =
    auth?.user?.name?.split(" ")?.[1]?.[0]?.toUpperCase() || "";

  if (role === "assistant") {
    return (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          gap: { xs: 1.5, sm: 2 },
          my: 1.5,
          alignItems: "flex-start",
        }}
      >
        {/* Gemini Avatar */}
        <Avatar
          sx={{
            bgcolor: isDark ? "rgba(0, 255, 252, 0.15)" : "rgba(2, 132, 199, 0.12)",
            color: isDark ? "#00fffc" : "#0284c7",
            border: `1.5px solid ${isDark ? "rgba(0, 255, 252, 0.3)" : "rgba(2, 132, 199, 0.25)"}`,
            width: { xs: 36, sm: 42 },
            height: { xs: 36, sm: 42 },
            flexShrink: 0,
            mt: 0.5,
            boxShadow: isDark
              ? "0 0 15px rgba(0, 255, 252, 0.2)"
              : "0 2px 8px rgba(2, 132, 199, 0.15)",
          }}
        >
          <img
            src="/gemini.png"
            alt="gemini"
            width="24px"
            style={{ objectFit: "contain" }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <RiRobot2Fill size={20} />
        </Avatar>

        {/* Assistant Response Card */}
        <Box
          sx={{
            flex: 1,
            maxWidth: "92%",
            bgcolor: isDark
              ? "rgba(13, 25, 41, 0.7)"
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${isDark ? "rgba(56, 189, 248, 0.15)" : "rgba(0, 0, 0, 0.08)"}`,
            borderRadius: "18px",
            borderTopLeftRadius: "4px",
            p: { xs: 2, sm: 2.5 },
            boxShadow: isDark
              ? "0 4px 20px rgba(0, 0, 0, 0.3)"
              : "0 2px 12px rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s ease",
          }}
        >
          {/* Header Row: Model Name & Copy Action */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.2,
              pb: 0.8,
              borderBottom: `1px solid ${isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  letterSpacing: "0.5px",
                  background: isDark
                    ? "linear-gradient(90deg, #00fffc, #38bdf8)"
                    : "linear-gradient(90deg, #0284c7, #6366f1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Gemini 3.6 AI
              </Typography>
              <Box
                sx={{
                  px: 0.8,
                  py: 0.2,
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  bgcolor: isDark ? "rgba(0, 255, 252, 0.1)" : "rgba(2, 132, 199, 0.1)",
                  color: isDark ? "#00fffc" : "#0284c7",
                }}
              >
                Smart Assistant
              </Box>
            </Box>

            <Tooltip title={copied ? "Copied to clipboard!" : "Copy response"}>
              <IconButton
                size="small"
                onClick={handleCopyAll}
                sx={{
                  color: copied ? "#10b981" : isDark ? "#94a3b8" : "#64748b",
                  p: 0.6,
                  "&:hover": {
                    color: isDark ? "#ffffff" : "#0f172a",
                    bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                  },
                }}
              >
                {copied ? <IoCheckmarkOutline size={16} /> : <IoCopyOutline size={16} />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Formatted Content */}
          <MarkdownContent content={content} />
        </Box>
      </Box>
    );
  }

  // User Message
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        gap: { xs: 1.5, sm: 2 },
        my: 1.5,
        justifyContent: "flex-end",
        alignItems: "flex-start",
      }}
    >
      {/* User Bubble */}
      <Box
        sx={{
          maxWidth: { xs: "85%", sm: "75%" },
          background: isDark
            ? "linear-gradient(135deg, #0e7490, #155e75)"
            : "linear-gradient(135deg, #0284c7, #0369a1)",
          color: "#ffffff",
          borderRadius: "18px",
          borderTopRightRadius: "4px",
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          boxShadow: isDark
            ? "0 4px 16px rgba(14, 116, 144, 0.3)"
            : "0 4px 16px rgba(2, 132, 199, 0.25)",
        }}
      >
        <Typography
          sx={{
            fontSize: "15.5px",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontWeight: 500,
          }}
        >
          {content}
        </Typography>
      </Box>

      {/* User Avatar */}
      <Avatar
        sx={{
          bgcolor: isDark ? "#0f172a" : "#334155",
          color: "#ffffff",
          border: `1.5px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}`,
          fontWeight: 700,
          width: { xs: 36, sm: 42 },
          height: { xs: 36, sm: 42 },
          fontSize: "15px",
          flexShrink: 0,
          mt: 0.5,
        }}
      >
        {userInitial1}
        {userInitial2}
      </Avatar>
    </Box>
  );
};

export default ChatItem;
