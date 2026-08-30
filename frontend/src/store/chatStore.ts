import { create } from "zustand";
import {
  deleteUserChats,
  getUserChats,
  sendChatRequest,
  getErrorMessage,
} from "../helpers/api-communicator";
import toast from "react-hot-toast";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export interface ChatState {
  chatMessages: Message[];
  loading: boolean;
  isSending: boolean;
  error: string | null;
  loadChats: () => Promise<void>;
  sendPrompt: (content: string) => Promise<void>;
  clearChats: () => Promise<void>;
  setChatMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatMessages: [],
  loading: true,
  isSending: false,
  error: null,

  setChatMessages: (messages: Message[]) => {
    set({ chatMessages: messages });
  },

  loadChats: async () => {
    set({ loading: true, error: null });
    try {
      toast.loading("Loading Chats...", { id: "loadchats" });
      const data = await getUserChats();
      if (data && data.chats) {
        set({ chatMessages: data.chats, loading: false });
        toast.success("Loaded chat history", { id: "loadchats" });
      } else {
        set({ chatMessages: [], loading: false });
      }
    } catch (err: unknown) {
      console.error("Get chats error:", err);
      const msg = getErrorMessage(err, "Failed to load chats");
      set({ error: msg, loading: false });
      toast.error(msg, { id: "loadchats" });
    }
  },

  sendPrompt: async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || get().isSending) return;

    const userMessage: Message = { role: "user", content: trimmed };
    set((state) => ({
      chatMessages: [...state.chatMessages, userMessage],
      isSending: true,
      error: null,
    }));

    try {
      const chatData = await sendChatRequest(trimmed);
      if (chatData && chatData.chats) {
        set({ chatMessages: chatData.chats, isSending: false });
      } else {
        set({ isSending: false });
      }
    } catch (error: unknown) {
      console.error("Chat send error:", error);
      const msg = getErrorMessage(error, "Failed to send message");
      toast.error(msg);
      set((state) => ({
        chatMessages: [
          ...state.chatMessages,
          {
            role: "assistant",
            content: "⚠️ Failed to get a response. Please try again in a moment.",
          },
        ],
        isSending: false,
        error: msg,
      }));
    }
  },

  clearChats: async () => {
    try {
      toast.loading("Clearing Conversation...", { id: "deletechats" });
      await deleteUserChats();
      set({ chatMessages: [] });
      toast.success("Conversation cleared successfully", { id: "deletechats" });
    } catch (error: unknown) {
      console.error("Delete chats error:", error);
      const msg = getErrorMessage(error, "Failed to clear chats");
      toast.error(msg, { id: "deletechats" });
      throw error;
    }
  },
}));
