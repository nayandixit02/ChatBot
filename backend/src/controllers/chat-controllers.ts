import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import genAI from "../config/gemini-config.js";

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
    const fullPrompt = `${chatsText}\n${userMessage}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([fullPrompt]);

    const assistantReply = result.response.text();

    if (assistantReply) {
      user.chats.push({
        role: "assistant",
        content: assistantReply,
      });
    }

    await user.save();
    return res.status(200).json({ chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
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
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats || [] });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
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
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    // Clear chats array
    user.chats.splice(0, user.chats.length);
    await user.save();

    return res.status(200).json({ message: "OK" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};
