import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Drawer,
  Chip,
  Tooltip,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { useAuth } from "../context/useAuth";
import { useThemeMode } from "../context/ThemeContext";
import { useChatStore } from "../store/chatStore";
import ChatItem from "../components/chat/ChatItem";
import { IoMdSend } from "react-icons/io";
import {
  HiMenuAlt2,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineArrowDown,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const SUGGESTED_PROMPTS = [
  {
    title: "💡 System Design",
    prompt: "How would you design a scalable URL Shortener like Bitly?",
  },
  {
    title: "⚡ Coding / DSA",
    prompt: "Implement an LRU Cache with O(1) get and put in JavaScript.",
  },
  {
    title: "🎯 Interview Prep",
    prompt: "Give me top 3 behavioral and technical questions for an SDE 2 role.",
  },
  {
    title: "🚀 Code Review",
    prompt: "What are the best practices for React 19 state management and performance?",
  },
];

const Chat = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const auth = useAuth();
  const { isDark } = useThemeMode();

  // Zustand Store Slices
  const chatMessages = useChatStore((state) => state.chatMessages);
  const loading = useChatStore((state) => state.loading);
  const isSending = useChatStore((state) => state.isSending);
  const loadChats = useChatStore((state) => state.loadChats);
  const sendPrompt = useChatStore((state) => state.sendPrompt);
  const clearChats = useChatStore((state) => state.clearChats);

  // Local UI State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isSending]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isUp);
  };

  const handleSendPrompt = async (textToSend?: string) => {
    const content = textToSend || inputRef.current?.value?.trim();
    if (!content || isSending) return;

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    await sendPrompt(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const handleDeleteChats = async () => {
    if (window.confirm("Are you sure you want to clear the entire conversation?")) {
      try {
        await clearChats();
        setMobileDrawerOpen(false);
      } catch (error) {
        console.error("Delete chats error:", error);
      }
    }
  };

  useLayoutEffect(() => {
    if (auth?.loading) return;

    if (auth?.isLoggedIn && auth.user) {
      loadChats();
    } else {
      navigate("/login");
    }
  }, [auth?.loading, auth?.isLoggedIn, auth?.user, navigate, loadChats]);

  if (auth?.loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="70vh"
        gap={2}
      >
        <CircularProgress sx={{ color: isDark ? "#00fffc" : "#0284c7" }} />
        <Typography color={isDark ? "white" : "black"}>
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  const userInitial1 = auth?.user?.name?.[0]?.toUpperCase() || "U";
  const userInitial2 =
    auth?.user?.name?.split(" ")?.[1]?.[0]?.toUpperCase() || "";

  // Sidebar content (Shared between desktop sidebar & mobile drawer)
  const SidebarContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: 2.5,
        bgcolor: isDark ? "#0d1929" : "#ffffff",
        color: isDark ? "#f8fafc" : "#0f172a",
        boxSizing: "border-box",
      }}
    >
      {/* Profile Card */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          borderRadius: 3,
          bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
          mb: 3,
        }}
      >
        <Avatar
          sx={{
            width: 58,
            height: 58,
            mb: 1.5,
            fontSize: "20px",
            fontWeight: 800,
            bgcolor: isDark ? "#00fffc" : "#0284c7",
            color: isDark ? "#000000" : "#ffffff",
            boxShadow: isDark
              ? "0 0 20px rgba(0, 255, 252, 0.3)"
              : "0 4px 12px rgba(2, 132, 199, 0.2)",
          }}
        >
          {userInitial1}
          {userInitial2}
        </Avatar>

        <Typography sx={{ fontWeight: 700, fontSize: "16px" }}>
          {auth?.user?.name || "User"}
        </Typography>

        <Typography
          sx={{
            fontSize: "12.5px",
            color: isDark ? "#94a3b8" : "#64748b",
            mt: 0.2,
          }}
        >
          {auth?.user?.email}
        </Typography>
      </Box>

      {/* Info Card */}
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: isDark ? "rgba(0, 255, 252, 0.05)" : "rgba(2, 132, 199, 0.05)",
          border: `1px solid ${isDark ? "rgba(0, 255, 252, 0.12)" : "rgba(2, 132, 199, 0.12)"}`,
          mb: "auto",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <HiOutlineSparkles
            color={isDark ? "#00fffc" : "#0284c7"}
            size={18}
          />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "13.5px",
              color: isDark ? "#00fffc" : "#0284c7",
            }}
          >
            Gemini Assistant
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: "13px",
            lineHeight: 1.5,
            color: isDark ? "#cbd5e1" : "#475569",
          }}
        >
          Ask questions about Full Stack Development, Algorithms, System Architecture, Code Debugging, and Career Advice.
        </Typography>
      </Box>

      {/* Clear Conversation Action */}
      <Button
        onClick={handleDeleteChats}
        disabled={chatMessages.length === 0}
        startIcon={<HiOutlineTrash size={18} />}
        sx={{
          mt: 2,
          py: 1.2,
          width: "100%",
          color: "white",
          bgcolor: red[500],
          boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)",
          "&:hover": {
            bgcolor: red[600],
          },
          "&.Mui-disabled": {
            bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
          },
        }}
      >
        Clear Conversation
      </Button>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        width: "100%",
        height: "calc(100vh - 75px)",
        p: { xs: 1.5, sm: 2, md: 3 },
        gap: { xs: 0, md: 3 },
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Desktop Floating Sidebar */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 0.28,
          maxWidth: "340px",
          height: "100%",
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.3)"
            : "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        {SidebarContent}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 290,
            bgcolor: isDark ? "#0d1929" : "#ffffff",
          },
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* Main Chat Area */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          height: "100%",
          bgcolor: isDark ? "rgba(13, 25, 41, 0.4)" : "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(10px)",
          borderRadius: 4,
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.3)"
            : "0 4px 20px rgba(0,0,0,0.05)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Chat Top Banner */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, sm: 3 },
            py: 1.5,
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            bgcolor: isDark ? "rgba(9, 16, 26, 0.6)" : "rgba(248, 250, 252, 0.8)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Mobile Drawer Hamburger */}
            <IconButton
              onClick={() => setMobileDrawerOpen(true)}
              sx={{
                display: { xs: "flex", md: "none" },
                color: isDark ? "#00fffc" : "#0284c7",
                p: 0.8,
              }}
            >
              <HiMenuAlt2 size={22} />
            </IconButton>

            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "16px", sm: "19px" },
                  fontWeight: 700,
                  color: isDark ? "#f8fafc" : "#0f172a",
                }}
              >
                Google Gemini AI
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: isDark ? "#38bdf8" : "#0284c7",
                  fontWeight: 600,
                }}
              >
                ● Active • Model gemini-3.6-flash
              </Typography>
            </Box>
          </Box>

          <Chip
            label={`${chatMessages.length} Messages`}
            size="small"
            sx={{
              bgcolor: isDark ? "rgba(0,255,252,0.1)" : "rgba(2,132,199,0.1)",
              color: isDark ? "#00fffc" : "#0284c7",
              fontWeight: 700,
              fontSize: "11px",
            }}
          />
        </Box>

        {/* Conversation Feed */}
        <Box
          ref={chatContainerRef}
          onScroll={handleScroll}
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 1.5, sm: 3 },
            display: "flex",
            flexDirection: "column",
            gap: 1,
            scrollBehavior: "smooth",
          }}
        >
          {loading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              my="auto"
            >
              <CircularProgress
                size={34}
                sx={{ color: isDark ? "#00fffc" : "#0284c7", mb: 2 }}
              />
              <Typography sx={{ color: isDark ? "#94a3b8" : "#64748b" }}>
                Loading conversation history...
              </Typography>
            </Box>
          ) : chatMessages.length > 0 ? (
            <>
              {chatMessages.map((chat, index) => (
                <ChatItem
                  key={index}
                  content={chat.content}
                  role={chat.role}
                />
              ))}

              {isSending && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 2,
                    my: 1,
                    maxWidth: "320px",
                    borderRadius: 3,
                    bgcolor: isDark
                      ? "rgba(0, 255, 252, 0.08)"
                      : "rgba(2, 132, 199, 0.08)",
                    border: `1px solid ${isDark ? "rgba(0, 255, 252, 0.2)" : "rgba(2, 132, 199, 0.2)"}`,
                  }}
                >
                  <CircularProgress
                    size={20}
                    sx={{ color: isDark ? "#00fffc" : "#0284c7" }}
                  />
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: isDark ? "#00fffc" : "#0284c7",
                    }}
                  >
                    Gemini is thinking...
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            /* Empty State Hero */
            <Box
              sx={{
                my: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                py: 4,
                px: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: isDark
                    ? "rgba(0, 255, 252, 0.12)"
                    : "rgba(2, 132, 199, 0.12)",
                  color: isDark ? "#00fffc" : "#0284c7",
                  border: `2px solid ${isDark ? "rgba(0, 255, 252, 0.3)" : "rgba(2, 132, 199, 0.3)"}`,
                  mb: 2,
                  boxShadow: isDark
                    ? "0 0 25px rgba(0, 255, 252, 0.25)"
                    : "0 4px 16px rgba(2, 132, 199, 0.15)",
                }}
              >
                <HiOutlineSparkles size={36} />
              </Avatar>

              <Typography
                sx={{
                  fontSize: { xs: "22px", sm: "26px" },
                  fontWeight: 800,
                  mb: 1,
                  color: isDark ? "#f8fafc" : "#0f172a",
                }}
              >
                How can Gemini assist you today?
              </Typography>

              <Typography
                sx={{
                  fontSize: "14.5px",
                  color: isDark ? "#94a3b8" : "#64748b",
                  maxWidth: "500px",
                  mb: 4,
                }}
              >
                Select a topic below or type your prompt to get instant, accurate code and answers.
              </Typography>

              {/* Starter Suggestion Chips */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                  maxWidth: "680px",
                  width: "100%",
                }}
              >
                {SUGGESTED_PROMPTS.map((item, i) => (
                  <Box
                    key={i}
                    onClick={() => handleSendPrompt(item.prompt)}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(255,255,255,0.9)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        bgcolor: isDark
                          ? "rgba(0, 255, 252, 0.08)"
                          : "rgba(2, 132, 199, 0.08)",
                        borderColor: isDark
                          ? "rgba(0, 255, 252, 0.3)"
                          : "rgba(2, 132, 199, 0.3)",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "13.5px",
                        color: isDark ? "#00fffc" : "#0284c7",
                        mb: 0.5,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: isDark ? "#cbd5e1" : "#475569",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.prompt}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Floating Scroll To Bottom Button */}
        {showScrollBottom && (
          <Tooltip title="Scroll to latest">
            <IconButton
              onClick={() => scrollToBottom("smooth")}
              sx={{
                position: "absolute",
                bottom: 85,
                right: 24,
                bgcolor: isDark ? "#00fffc" : "#0284c7",
                color: isDark ? "#000000" : "#ffffff",
                boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                "&:hover": {
                  bgcolor: isDark ? "#5ffffd" : "#0369a1",
                },
              }}
            >
              <HiOutlineArrowDown size={20} />
            </IconButton>
          </Tooltip>
        )}

        {/* Input Bar */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            bgcolor: isDark ? "rgba(9, 16, 26, 0.85)" : "rgba(248, 250, 252, 0.9)",
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: isDark ? "#09121d" : "#ffffff",
              borderRadius: "24px",
              px: { xs: 1.5, sm: 2.5 },
              py: 0.8,
              border: `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
              transition: "all 0.2s ease",
              "&:focus-within": {
                borderColor: isDark ? "#00fffc" : "#0284c7",
                boxShadow: isDark
                  ? "0 0 16px rgba(0, 255, 252, 0.2)"
                  : "0 0 16px rgba(2, 132, 199, 0.15)",
              },
            }}
          >
            <input
              ref={inputRef}
              type="text"
              onKeyDown={handleKeyDown}
              disabled={isSending}
              placeholder={
                isSending
                  ? "Waiting for Gemini to respond..."
                  : "Ask anything... (Press Enter to send)"
              }
              style={{
                width: "100%",
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                padding: "10px 4px",
                color: isDark ? "#f8fafc" : "#0f172a",
                fontSize: "15.5px",
                fontFamily: "inherit",
              }}
            />

            <Tooltip title="Send prompt">
              <span>
                <IconButton
                  onClick={() => handleSendPrompt()}
                  disabled={isSending}
                  sx={{
                    bgcolor: isDark ? "#00fffc" : "#0284c7",
                    color: isDark ? "#000000" : "#ffffff",
                    p: 1,
                    ml: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: isDark ? "#5ffffd" : "#0369a1",
                      transform: "scale(1.05)",
                    },
                    "&.Mui-disabled": {
                      bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  <IoMdSend size={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
