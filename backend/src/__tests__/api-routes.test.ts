import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { COOKIE_NAME } from "../utils/constants.js";

describe("API Routes & Express Integration Tests (Supertest)", () => {
  const secret = process.env.JWT_SECRET || "test_jwt_secret_key_123456789";
  const validToken = jwt.sign({ id: "64cb1f000000000000000001", email: "test@example.com" }, secret, {
    expiresIn: "7d",
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET /test-key and /api/v1/test-key", () => {
    it("should respond to GET /test-key", async () => {
      jest.spyOn(GoogleGenerativeAI.prototype, "getGenerativeModel").mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: Promise.resolve({ text: () => "WORKING" }),
        } as any),
      } as any);

      const res = await request(app).get("/test-key");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("ok");
    });

    it("should respond to GET /api/v1/test-key", async () => {
      jest.spyOn(GoogleGenerativeAI.prototype, "getGenerativeModel").mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: Promise.resolve({ text: () => "WORKING" }),
        } as any),
      } as any);

      const res = await request(app).get("/api/v1/test-key");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("ok");
    });
  });

  describe("User Authentication Endpoints", () => {
    describe("POST /api/v1/user/signup", () => {
      it("should reject signup when required fields are missing (validation error 422)", async () => {
        const res = await request(app).post("/api/v1/user/signup").send({
          name: "",
          email: "invalid-email",
          password: "123",
        });

        expect(res.status).toBe(422);
        expect(res.body).toHaveProperty("errors");
      });

      it("should successfully signup user when valid data provided", async () => {
        jest.spyOn(User, "findOne").mockResolvedValue(null as any);
        jest.spyOn(User.prototype, "save").mockResolvedValue(true as any);

        const res = await request(app).post("/api/v1/user/signup").send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("OK");
        expect(res.body.email).toBe("test@example.com");
        expect(res.headers["set-cookie"]).toBeDefined();
      });
    });

    describe("POST /api/v1/user/login", () => {
      it("should reject login with 422 when body fails validation", async () => {
        const res = await request(app).post("/api/v1/user/login").send({
          email: "notanemail",
          password: "short",
        });

        expect(res.status).toBe(422);
      });

      it("should authenticate valid login and return cookie", async () => {
        const realHashedPassword = await bcrypt.hash("password123", 10);
        const mockUser = {
          _id: { toString: () => "64cb1f000000000000000001" },
          name: "Test User",
          email: "test@example.com",
          password: realHashedPassword,
        };
        jest.spyOn(User, "findOne").mockResolvedValue(mockUser as any);

        const res = await request(app).post("/api/v1/user/login").send({
          email: "test@example.com",
          password: "password123",
        });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("OK");
        expect(res.body.token).toBeDefined();
      });
    });

    describe("GET /api/v1/user/auth-status", () => {
      it("should return 401 when no token is supplied", async () => {
        const res = await request(app).get("/api/v1/user/auth-status");
        expect(res.status).toBe(401);
      });

      it("should verify authenticated user with Bearer token header", async () => {
        const mockUser = {
          _id: { toString: () => "64cb1f000000000000000001" },
          name: "Test User",
          email: "test@example.com",
        };
        jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

        const res = await request(app)
          .get("/api/v1/user/auth-status")
          .set("Authorization", `Bearer ${validToken}`);

        expect(res.status).toBe(200);
        expect(res.body.name).toBe("Test User");
        expect(res.body.email).toBe("test@example.com");
      });

      it("should verify authenticated user with signed cookie", async () => {
        const mockUser = {
          _id: { toString: () => "64cb1f000000000000000001" },
          name: "Cookie User",
          email: "cookie@example.com",
        };
        const cookieToken = jwt.sign(
          { id: "64cb1f000000000000000001", email: "cookie@example.com" },
          secret
        );
        jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

        const res = await request(app)
          .get("/api/v1/user/auth-status")
          .set("Cookie", [`${COOKIE_NAME}=${cookieToken}`]);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe("cookie@example.com");
      });
    });

    describe("GET /api/v1/user/logout", () => {
      it("should logout user and clear cookie", async () => {
        const mockUser = {
          _id: { toString: () => "64cb1f000000000000000001" },
          name: "Test User",
          email: "test@example.com",
        };
        jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

        const res = await request(app)
          .get("/api/v1/user/logout")
          .set("Authorization", `Bearer ${validToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("OK");
      });
    });
  });

  describe("Chat Endpoints", () => {
    describe("POST /api/v1/chat/new", () => {
      it("should reject message creation with 422 if message body is empty", async () => {
        const res = await request(app)
          .post("/api/v1/chat/new")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ message: "" });

        expect(res.status).toBe(422);
      });

      it("should reject message creation with 401 if unauthenticated", async () => {
        const res = await request(app).post("/api/v1/chat/new").send({ message: "Hello" });

        expect(res.status).toBe(401);
      });

      it("should process chat completion successfully for authenticated user", async () => {
        const mockUser = {
          _id: { toString: () => "64cb1f000000000000000001" },
          chats: [],
          save: jest.fn().mockResolvedValue(true as any),
        };
        jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

        jest.spyOn(GoogleGenerativeAI.prototype, "getGenerativeModel").mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: Promise.resolve({
              text: () => "Hello! How can I assist you today?",
            }),
          } as any),
        } as any);

        const res = await request(app)
          .post("/api/v1/chat/new")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ message: "Hello" });

        expect(res.status).toBe(200);
        expect(res.body.chats).toHaveLength(2);
        expect(res.body.chats[1].content).toBe("Hello! How can I assist you today?");
      });
    });

    describe("GET /api/v1/chat/chats", () => {
      it("should return chat history for authenticated user", async () => {
        const mockUser = {
          _id: { toString: () => "64cb1f000000000000000001" },
          chats: [{ role: "user", content: "Hi" }],
        };
        jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

        const res = await request(app)
          .get("/api/v1/chat/chats")
          .set("Authorization", `Bearer ${validToken}`);

        expect(res.status).toBe(200);
        expect(res.body.chats).toEqual([{ role: "user", content: "Hi" }]);
      });
    });

    describe("DELETE /api/v1/chat/delete", () => {
      it("should delete chat history and return 200", async () => {
        const mockUser = {
          _id: { toString: () => "64cb1f000000000000000001" },
          chats: [{ role: "user", content: "Hi" }],
          save: jest.fn().mockResolvedValue(true as any),
        };
        jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

        const res = await request(app)
          .delete("/api/v1/chat/delete")
          .set("Authorization", `Bearer ${validToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("OK");
      });
    });
  });
});
