import { jest, describe, it, expect, beforeEach, afterAll } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  testGeminiKey,
  generateChatCompletion,
  sendChatsToUser,
  deleteChats,
} from "../controllers/chat-controllers.js";

describe("Chat Controllers Unit Tests", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = { ...originalEnv, GEMINI_API_KEY: "AIzaSyTestKey1234567890" };

    mockReq = {
      body: {},
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
      locals: {},
    };
    mockNext = jest.fn() as any;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("testGeminiKey", () => {
    it("should return ok: false if GEMINI_API_KEY is not set", async () => {
      delete process.env.GEMINI_API_KEY;

      await testGeminiKey(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: false,
          error: "GEMINI_API_KEY is not set in backend environment variables.",
        })
      );
    });

    it("should test candidate models and return results", async () => {
      process.env.GEMINI_API_KEY = "AIzaSyTestKey1234567890";
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: Promise.resolve({
          text: () => "WORKING",
        }),
      } as any);

      jest.spyOn(GoogleGenerativeAI.prototype, "getGenerativeModel").mockReturnValue({
        generateContent: mockGenerateContent,
      } as any);

      await testGeminiKey(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: true,
          maskedKey: expect.stringContaining("..."),
          results: expect.any(Object),
        })
      );
    });
  });

  describe("generateChatCompletion", () => {
    it("should return 401 if user is not found in database", async () => {
      mockRes.locals = { jwtData: { id: "user_not_found" } };
      mockReq.body = { message: "Hello" };
      jest.spyOn(User, "findById").mockResolvedValue(null as any);

      await generateChatCompletion(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User not registered OR Token malfunctioned",
      });
    });

    it("should return 500 if GEMINI_API_KEY is missing from environment", async () => {
      delete process.env.GEMINI_API_KEY;
      mockRes.locals = { jwtData: { id: "user123" } };
      mockReq.body = { message: "Hello" };
      jest.spyOn(User, "findById").mockResolvedValue({
        _id: "user123",
        chats: [],
      } as any);

      await generateChatCompletion(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "AI provider error",
          cause: expect.stringContaining("GEMINI_API_KEY is missing"),
        })
      );
    });

    it("should generate AI completion, save conversation to user, and return updated chats", async () => {
      process.env.GEMINI_API_KEY = "AIzaSyTestKey1234567890";
      mockRes.locals = { jwtData: { id: "user123" } };
      mockReq.body = { message: "What is TypeScript?" };

      const mockChats: any[] = [];
      const mockUser = {
        _id: "user123",
        chats: mockChats,
        save: jest.fn().mockResolvedValue(true as any),
      };
      jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: Promise.resolve({
          text: () => "TypeScript is a typed superset of JavaScript.",
        }),
      } as any);

      jest.spyOn(GoogleGenerativeAI.prototype, "getGenerativeModel").mockReturnValue({
        generateContent: mockGenerateContent,
      } as any);

      await generateChatCompletion(mockReq as Request, mockRes as Response, mockNext);

      expect(mockUser.chats.length).toBe(2);
      expect(mockUser.chats[0]).toEqual({ role: "user", content: "What is TypeScript?" });
      expect(mockUser.chats[1]).toEqual({
        role: "assistant",
        content: "TypeScript is a typed superset of JavaScript.",
      });
      expect(mockUser.save).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ chats: mockUser.chats });
    });

    it("should handle 429 quota error gracefully with retry message", async () => {
      process.env.GEMINI_API_KEY = "AIzaSyTestKey1234567890";
      mockRes.locals = { jwtData: { id: "user123" } };
      mockReq.body = { message: "Tell me a joke" };

      const mockUser = {
        _id: "user123",
        chats: [],
        save: jest.fn().mockResolvedValue(true as any),
      };
      jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

      const quotaError: any = new Error("429 Too Many Requests: RESOURCE_EXHAUSTED");
      quotaError.status = 429;
      quotaError.errorDetails = [{ "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "10s" }];

      jest.spyOn(GoogleGenerativeAI.prototype, "getGenerativeModel").mockReturnValue({
        generateContent: jest.fn().mockRejectedValue(quotaError as any),
      } as any);

      await generateChatCompletion(mockReq as Request, mockRes as Response, mockNext);

      expect(mockUser.chats.length).toBe(2);
      expect((mockUser.chats[1] as any).content).toContain("AI quota exceeded");
      expect(mockUser.save).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should return 502 if all candidate models fail", async () => {
      process.env.GEMINI_API_KEY = "AIzaSyTestKey1234567890";
      mockRes.locals = { jwtData: { id: "user123" } };
      mockReq.body = { message: "Hello" };

      const mockUser = {
        _id: "user123",
        chats: [],
        save: jest.fn(),
      };
      jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

      jest.spyOn(GoogleGenerativeAI.prototype, "getGenerativeModel").mockReturnValue({
        generateContent: jest.fn().mockRejectedValue(new Error("Generic model failure") as any),
      } as any);

      await generateChatCompletion(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(502);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "AI provider error",
          modelErrors: expect.any(Object),
        })
      );
    });
  });

  describe("sendChatsToUser", () => {
    it("should return 401 if user is not found", async () => {
      mockRes.locals = { jwtData: { id: "user123" } };
      jest.spyOn(User, "findById").mockResolvedValue(null as any);

      await sendChatsToUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should return 401 if user id does not match token id", async () => {
      mockRes.locals = { jwtData: { id: "user123" } };
      jest.spyOn(User, "findById").mockResolvedValue({
        _id: { toString: () => "different_user_id" },
      } as any);

      await sendChatsToUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Permissions didn't match" });
    });

    it("should return 200 with user's chat history", async () => {
      const existingChats = [
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello!" },
      ];
      mockRes.locals = { jwtData: { id: "user123" } };
      jest.spyOn(User, "findById").mockResolvedValue({
        _id: { toString: () => "user123" },
        chats: existingChats,
      } as any);

      await sendChatsToUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "OK",
        chats: existingChats,
      });
    });

    it("should return 500 on database error", async () => {
      mockRes.locals = { jwtData: { id: "user123" } };
      jest.spyOn(User, "findById").mockRejectedValue(new Error("Database fetch error") as any);

      await sendChatsToUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteChats", () => {
    it("should return 401 if user is not found", async () => {
      mockRes.locals = { jwtData: { id: "user123" } };
      jest.spyOn(User, "findById").mockResolvedValue(null as any);

      await deleteChats(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should return 401 if user permissions do not match", async () => {
      mockRes.locals = { jwtData: { id: "user123" } };
      jest.spyOn(User, "findById").mockResolvedValue({
        _id: { toString: () => "other_id" },
      } as any);

      await deleteChats(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should clear chat history, save user, and return 200", async () => {
      mockRes.locals = { jwtData: { id: "user123" } };
      const chats = [{ role: "user", content: "Hello" }];
      const mockUser = {
        _id: { toString: () => "user123" },
        chats,
        save: jest.fn().mockResolvedValue(true as any),
      };
      jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

      await deleteChats(mockReq as Request, mockRes as Response, mockNext);

      expect(mockUser.chats.length).toBe(0);
      expect(mockUser.save).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "OK" });
    });

    it("should return 500 on save error", async () => {
      mockRes.locals = { jwtData: { id: "user123" } };
      jest.spyOn(User, "findById").mockRejectedValue(new Error("DB Error") as any);

      await deleteChats(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
