import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import genAI from "../config/gemini-config.js";

const getErrMsg = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user)
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });

    // Convert stored chats to Gemini-compatible input (flattened text)
    const chatsText = user.chats
      .map(
        (chat: any) =>
          `${chat.role === "user" ? "User" : "Assistant"}: ${chat.content}`
      )
      .join("\n");

    // Add new user message
    const userMessage = `User: ${message}`;
    user.chats.push({ role: "user", content: message });

    // Combine into full prompt
    const fullPrompt = chatsText ? `${chatsText}\n${userMessage}` : userMessage;

    // List of candidate models to try in order of preference
    const candidateModels = [
      process.env.GEMINI_MODEL,
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-pro",
      "gemini-pro",
    ].filter(Boolean) as string[];

    let assistantReply: string | null = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([fullPrompt]);
        assistantReply = result.response.text();
        if (assistantReply) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} invocation failed:`, err?.message ?? err);

        // On quota/rate-limit (429), surface a friendly assistant message
        if (err && err.status === 429) {
          const retryInfo = err.errorDetails?.find((d: any) =>
            d["@type"]?.includes("RetryInfo")
          );
          const retryDelay = retryInfo?.retryDelay ?? null;
          assistantReply = `I'm temporarily unable to generate a response (AI quota exceeded). Please try again after ${
            retryDelay ?? "a short while"
          }.`;
          break;
        }
        // If 404 (model deprecated/not available), loop will try the next candidate model
      }
    }

    if (!assistantReply) {
      console.error("All Gemini candidate models failed. Last error:", lastError);
      return res.status(502).json({
        message: "AI provider error",
        cause: lastError?.message ?? String(lastError),
      });
    }

    user.chats.push({
      role: "assistant",
      content: assistantReply,
    });

    await user.save();
    return res.status(200).json({ chats: user.chats });
  } catch (error: unknown) {
    console.error("Chat completion error:", error);
    return res.status(500).json({ message: "Something went wrong", cause: getErrMsg(error) });
  }
};

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).json({ message: "Permissions didn't match" });
    }
    return res.status(200).json({ message: "OK", chats: user.chats || [] });
  } catch (error: unknown) {
    console.error("sendChatsToUser error:", error);
    return res.status(500).json({ message: "ERROR", cause: getErrMsg(error) });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  } catch (error: unknown) {
    console.error("deleteChats error:", error);
    return res.status(500).json({ message: "ERROR", cause: getErrMsg(error) });
  }
};
