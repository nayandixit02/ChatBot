import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { useAuth } from "../context/useAuth";
import ChatItem from "../components/chat/ChatItem";
import { IoMdSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import {
  deleteUserChats,
  getUserChats,
  sendChatRequest,
  getErrorMessage,
} from "../helpers/api-communicator";
import toast from "react-hot-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Chat = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const auth = useAuth();

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isSending]);

  const handleSubmit = async () => {
    const content = inputRef.current?.value?.trim();
    if (!content || isSending) return;

    if (inputRef.current) inputRef.current.value = "";

    const newMessage: Message = { role: "user", content };
    setChatMessages((prev) => [...prev, newMessage]);
    setIsSending(true);

    try {
      const chatData = await sendChatRequest(content);
      if (chatData && chatData.chats) {
        setChatMessages([...chatData.chats]);
      }
    } catch (error) {
      console.error("Chat send error:", error);
      const msg = getErrorMessage(error, "Failed to send message");
      toast.error(msg);
      // Fallback assistant error message in chat UI if network/provider error
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Failed to get a response. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDeleteChats = async () => {
    try {
      toast.loading("Deleting Chats...", { id: "deletechats" });
      await deleteUserChats();
      setChatMessages([]);
      toast.success("Deleted Chats Successfully", { id: "deletechats" });
    } catch (error) {
      console.error("Delete chats error:", error);
      const msg = getErrorMessage(error, "Deleting chats failed");
      toast.error(msg, { id: "deletechats" });
    }
  };

  useLayoutEffect(() => {
    if (auth?.loading) return;

    if (auth?.isLoggedIn && auth.user) {
      toast.loading("Loading Chats...", { id: "loadchats" });
      getUserChats()
        .then((data) => {
          if (data && data.chats) {
            setChatMessages([...data.chats]);
          }
          toast.success("Successfully loaded chats", { id: "loadchats" });
        })
        .catch((err) => {
          console.error("Get chats error:", err);
          const msg = getErrorMessage(err, "Failed to load chats");
          toast.error(msg, { id: "loadchats" });
        })
        .finally(() => setLoading(false));
    } else {
      navigate("/login");
    }
  }, [auth?.loading, auth?.isLoggedIn, auth?.user, navigate]);

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
        <CircularProgress sx={{ color: "#00fffc" }} />
        <Typography color="white">Checking authorization...</Typography>
      </Box>
    );
  }

  const userInitial1 = auth?.user?.name?.[0]?.toUpperCase() || "U";
  const userInitial2 = auth?.user?.name?.split(" ")?.[1]?.[0]?.toUpperCase() || "";

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        width: "100%",
        height: "100%",
        mt: 3,
        gap: 3,
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          display: { md: "flex", xs: "none", sm: "none" },
          flex: 0.25,
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "65vh",
            bgcolor: "rgb(17,29,39)",
            borderRadius: 5,
            flexDirection: "column",
            mx: 3,
            p: 2,
            boxSizing: "border-box",
          }}
        >
          <Avatar
            sx={{
              mx: "auto",
              my: 2,
              bgcolor: "white",
              color: "black",
              fontWeight: 700,
              width: 56,
              height: 56,
              fontSize: 22,
            }}
          >
            {userInitial1}
            {userInitial2}
          </Avatar>
          <Typography sx={{ mx: "auto", fontFamily: "work sans", fontWeight: 600 }}>
            {auth?.user?.name || "User"}
          </Typography>
          <Typography sx={{ mx: "auto", fontSize: "13px", color: "rgb(180, 180, 180)", mb: 2 }}>
            {auth?.user?.email}
          </Typography>
          <Typography sx={{ mx: "auto", fontFamily: "work sans", textAlign: "center", my: 2, px: 2, fontSize: "14px", color: "rgb(200, 200, 200)" }}>
            Ask Gemini questions about Coding, Knowledge, Business, Advice, Education, and more.
          </Typography>
          <Button
            onClick={handleDeleteChats}
            sx={{
              width: "200px",
              mt: "auto",
              mb: 2,
              color: "white",
              fontWeight: "700",
              borderRadius: 3,
              mx: "auto",
              bgcolor: red[400],
              ":hover": {
                bgcolor: red.A400,
              },
            }}
          >
            Clear Conversation
          </Button>
        </Box>
      </Box>

      {/* Main Chat Area */}
      <Box
        sx={{
          display: "flex",
          flex: { md: 0.75, xs: 1, sm: 1 },
          flexDirection: "column",
          px: { xs: 2, md: 3 },
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "24px", md: "34px" },
            color: "white",
            mb: 2,
            mx: "auto",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Powered by Google Gemini AI
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: "60vh",
            borderRadius: 3,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            scrollBehavior: "smooth",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            p: 2,
            boxSizing: "border-box",
          }}
        >
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" my="auto">
              <CircularProgress size={30} sx={{ color: "#00fffc", mb: 1 }} />
              <Typography color="white">Loading chat history...</Typography>
            </Box>
          ) : chatMessages.length > 0 ? (
            <>
              {chatMessages.map((chat, index) => (
                <ChatItem content={chat.content} role={chat.role} key={index} />
              ))}
              {isSending && (
                <Box
                  sx={{
                    display: "flex",
                    p: 2,
                    bgcolor: "#004d5612",
                    gap: 2,
                    borderRadius: 2,
                    my: 1,
                    alignItems: "center",
                  }}
                >
                  <CircularProgress size={20} sx={{ color: "#00fffc" }} />
                  <Typography sx={{ color: "#00fffc", fontSize: "16px" }}>
                    Gemini is thinking...
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Typography color="white" mx="auto" my="auto" textAlign="center">
              No chats yet. Start a conversation with Gemini!
            </Typography>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <div
          style={{
            width: "100%",
            borderRadius: 8,
            backgroundColor: "rgb(17,27,39)",
            display: "flex",
            margin: "auto",
            marginTop: "16px",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            onKeyDown={handleKeyDown}
            disabled={isSending}
            placeholder={isSending ? "Waiting for Gemini to respond..." : "Type your message here (Press Enter to send)..."}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              padding: "20px",
              border: "none",
              outline: "none",
              color: "white",
              fontSize: "18px",
            }}
          />
          <IconButton
            onClick={handleSubmit}
            disabled={isSending}
            sx={{
              color: isSending ? "gray" : "#00fffc",
              mx: 1,
              ":hover": { color: "white" },
            }}
          >
            <IoMdSend />
          </IconButton>
        </div>
      </Box>
    </Box>
  );
};

export default Chat;
