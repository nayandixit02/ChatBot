import User from "../models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
const getErrMsg = (error) => {
    if (error instanceof Error)
        return error.message;
    return String(error);
};
export const generateChatCompletion = async (req, res, next) => {
    const { message } = req.body;
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user)
            return res
                .status(401)
                .json({ message: "User not registered OR Token malfunctioned" });
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not configured in backend environment");
            return res.status(500).json({
                message: "AI provider error",
                cause: "GEMINI_API_KEY is missing from server environment variables.",
            });
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        // Build context from previous conversation, omitting error notifications
        const validChats = (user.chats || []).filter((c) => c &&
            c.content &&
            !c.content.startsWith("⚠️") &&
            !c.content.includes("temporarily unable"));
        // Use recent history for context
        const recentHistory = validChats.slice(-10);
        const chatsText = recentHistory
            .map((chat) => `${chat.role === "user" ? "User" : "Assistant"}: ${chat.content}`)
            .join("\n");
        const fullPrompt = chatsText
            ? `${chatsText}\nUser: ${message}\nAssistant:`
            : message;
        // List of reliable Gemini models
        const candidateModels = [
            process.env.GEMINI_MODEL,
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash-8b",
            "gemini-2.0-flash-exp",
        ].filter(Boolean);
        let assistantReply = null;
        let lastError = null;
        for (const modelName of candidateModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(fullPrompt);
                assistantReply = result.response.text();
                if (assistantReply) {
                    break;
                }
            }
            catch (err) {
                lastError = err;
                console.warn(`Gemini model ${modelName} failed:`, err?.message ?? err);
                // On quota/rate-limit (429), surface a friendly assistant message
                if (err && (err.status === 429 || String(err?.message).includes("429") || String(err?.message).includes("quota"))) {
                    const retryInfo = err.errorDetails?.find((d) => d["@type"]?.includes("RetryInfo"));
                    const retryDelay = retryInfo?.retryDelay ?? null;
                    assistantReply = `I'm temporarily unable to generate a response (AI quota exceeded). Please try again after ${retryDelay ?? "a short while"}.`;
                    break;
                }
            }
        }
        if (!assistantReply) {
            console.error("All Gemini candidate models failed. Last error:", lastError);
            return res.status(502).json({
                message: "AI provider error",
                cause: lastError?.message ?? String(lastError),
            });
        }
        // Save both user message and assistant reply to DB
        user.chats.push({ role: "user", content: message });
        user.chats.push({ role: "assistant", content: assistantReply });
        await user.save();
        return res.status(200).json({ chats: user.chats });
    }
    catch (error) {
        console.error("Chat completion error:", error);
        return res.status(500).json({ message: "Something went wrong", cause: getErrMsg(error) });
    }
};
export const sendChatsToUser = async (req, res, next) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({ message: "Permissions didn't match" });
        }
        return res.status(200).json({ message: "OK", chats: user.chats || [] });
    }
    catch (error) {
        console.error("sendChatsToUser error:", error);
        return res.status(500).json({ message: "ERROR", cause: getErrMsg(error) });
    }
};
export const deleteChats = async (req, res, next) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({ message: "Permissions didn't match" });
        }
        // Clear chats array
        user.chats.splice(0, user.chats.length);
        await user.save();
        return res.status(200).json({ message: "OK" });
    }
    catch (error) {
        console.error("deleteChats error:", error);
        return res.status(500).json({ message: "ERROR", cause: getErrMsg(error) });
    }
};
//# sourceMappingURL=chat-controllers.js.map