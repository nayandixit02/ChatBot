import User from "../models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
const getErrMsg = (error) => {
    if (error instanceof Error)
        return error.message;
    return String(error);
};
export const testGeminiKey = async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(200).json({
            ok: false,
            error: "GEMINI_API_KEY is not set in backend environment variables.",
        });
    }
    const maskedKey = apiKey.length > 10
        ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`
        : "INVALID_KEY_LENGTH";
    const modelsToTest = [
        process.env.GEMINI_MODEL,
        "gemini-3.6-flash",
        "gemini-3.6-pro",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
    ].filter(Boolean);
    const results = {};
    const genAI = new GoogleGenerativeAI(apiKey);
    for (const m of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Respond with: WORKING");
            const response = await result.response;
            results[m] = { success: true, text: response.text()?.trim() };
        }
        catch (err) {
            results[m] = { success: false, error: err?.message || String(err) };
        }
    }
    const anySuccess = Object.values(results).some((r) => r.success);
    return res.status(200).json({
        ok: anySuccess,
        maskedKey,
        results,
    });
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
        // List of candidate models in order of priority
        const candidateModels = [
            process.env.GEMINI_MODEL,
            "gemini-3.6-flash",
            "gemini-3.6-pro",
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
        ].filter(Boolean);
        let assistantReply = null;
        const modelErrors = {};
        for (const modelName of candidateModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(fullPrompt);
                const response = await result.response;
                assistantReply = response.text();
                if (assistantReply) {
                    break;
                }
            }
            catch (err) {
                modelErrors[modelName] = err?.message ?? String(err);
                console.warn(`Gemini model ${modelName} failed:`, err?.message ?? err);
                // On quota/rate-limit (429), surface a friendly assistant message
                if (err &&
                    (err.status === 429 ||
                        String(err?.message).includes("429") ||
                        String(err?.message).includes("quota") ||
                        String(err?.message).includes("RESOURCE_EXHAUSTED"))) {
                    const retryInfo = err.errorDetails?.find((d) => d["@type"]?.includes("RetryInfo"));
                    const retryDelay = retryInfo?.retryDelay ?? null;
                    assistantReply = `I'm temporarily unable to generate a response (AI quota exceeded). Please try again after ${retryDelay ?? "a short while"}.`;
                    break;
                }
            }
        }
        if (!assistantReply) {
            console.error("All Gemini candidate models failed:", modelErrors);
            return res.status(502).json({
                message: "AI provider error",
                cause: JSON.stringify(modelErrors),
                modelErrors,
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