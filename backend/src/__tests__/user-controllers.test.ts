import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  getAllUsers,
  userSignup,
  userLogin,
  verifyUser,
  userLogout,
} from "../controllers/user-controllers.js";
import { COOKIE_NAME } from "../utils/constants.js";

describe("User Controllers Unit Tests", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.restoreAllMocks();
    mockReq = {
      body: {},
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
      cookie: jest.fn() as any,
      clearCookie: jest.fn() as any,
      locals: {},
    };
    mockNext = jest.fn() as any;
  });

  describe("getAllUsers", () => {
    it("should return 200 with list of all users", async () => {
      const mockUsers = [
        { _id: "1", name: "Alice", email: "alice@test.com" },
        { _id: "2", name: "Bob", email: "bob@test.com" },
      ];
      jest.spyOn(User, "find").mockResolvedValue(mockUsers as any);

      await getAllUsers(mockReq as Request, mockRes as Response, mockNext);

      expect(User.find).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "OK", users: mockUsers });
    });

    it("should return 500 if database query fails", async () => {
      jest.spyOn(User, "find").mockRejectedValue(new Error("Database connection lost") as any);

      await getAllUsers(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "ERROR",
          cause: "Database connection lost",
        })
      );
    });
  });

  describe("userSignup", () => {
    it("should return 401 if user already exists with the email", async () => {
      mockReq.body = {
        name: "Test User",
        email: "existing@test.com",
        password: "password123",
      };
      jest.spyOn(User, "findOne").mockResolvedValue({
        _id: "existing_id",
        email: "existing@test.com",
      } as any);

      await userSignup(mockReq as Request, mockRes as Response, mockNext);

      expect(User.findOne).toHaveBeenCalledWith({ email: "existing@test.com" });
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "User already registered" });
    });

    it("should hash password, save user, set cookie, and return 201 on successful signup", async () => {
      mockReq.body = {
        name: "New User",
        email: "new@test.com",
        password: "password123",
      };
      jest.spyOn(User, "findOne").mockResolvedValue(null as any);
      jest.spyOn(User.prototype, "save").mockResolvedValue(true as any);

      await userSignup(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.clearCookie).toHaveBeenCalledWith(COOKIE_NAME, expect.any(Object));
      expect(mockRes.cookie).toHaveBeenCalledWith(
        COOKIE_NAME,
        expect.any(String),
        expect.objectContaining({ httpOnly: true })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "OK",
          name: "New User",
          email: "new@test.com",
          token: expect.any(String),
        })
      );
    });

    it("should return 500 if an error occurs during signup", async () => {
      mockReq.body = { name: "User", email: "u@t.com", password: "p" };
      jest.spyOn(User, "findOne").mockRejectedValue(new Error("DB Save Error") as any);

      await userSignup(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "ERROR", cause: "DB Save Error" })
      );
    });
  });

  describe("userLogin", () => {
    it("should return 401 if user is not found", async () => {
      mockReq.body = { email: "nonexistent@test.com", password: "pwd" };
      jest.spyOn(User, "findOne").mockResolvedValue(null as any);

      await userLogin(mockReq as Request, mockRes as Response, mockNext);

      expect(User.findOne).toHaveBeenCalledWith({ email: "nonexistent@test.com" });
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "User not registered" });
    });

    it("should return 403 if password does not match", async () => {
      const realHashedPassword = await bcrypt.hash("correctpassword", 10);
      mockReq.body = { email: "user@test.com", password: "wrongpassword" };
      const mockUser = {
        _id: "uid_123",
        email: "user@test.com",
        password: realHashedPassword,
      };
      jest.spyOn(User, "findOne").mockResolvedValue(mockUser as any);

      await userLogin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Incorrect Password" });
    });

    it("should return 200 with token and set auth cookie when password matches", async () => {
      const realHashedPassword = await bcrypt.hash("correctpassword", 10);
      mockReq.body = { email: "user@test.com", password: "correctpassword" };
      const mockUser = {
        _id: { toString: () => "uid_123" },
        name: "Test User",
        email: "user@test.com",
        password: realHashedPassword,
      };
      jest.spyOn(User, "findOne").mockResolvedValue(mockUser as any);

      await userLogin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.clearCookie).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith(
        COOKIE_NAME,
        expect.any(String),
        expect.objectContaining({ httpOnly: true })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "OK",
          id: "uid_123",
          name: "Test User",
          email: "user@test.com",
          token: expect.any(String),
        })
      );
    });

    it("should return 500 if error occurs during login", async () => {
      mockReq.body = { email: "err@test.com", password: "p" };
      jest.spyOn(User, "findOne").mockRejectedValue(new Error("Login Failure") as any);

      await userLogin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "ERROR", cause: "Login Failure" })
      );
    });
  });

  describe("verifyUser", () => {
    it("should return 401 if user is not found by ID", async () => {
      mockRes.locals = { jwtData: { id: "not_found_id", email: "nf@test.com" } };
      jest.spyOn(User, "findById").mockResolvedValue(null as any);

      await verifyUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User not registered OR Token malfunctioned",
      });
    });

    it("should return 401 if user ID does not match token ID", async () => {
      mockRes.locals = { jwtData: { id: "token_id", email: "u@test.com" } };
      const mockUser = {
        _id: { toString: () => "different_id" },
        name: "User",
        email: "u@test.com",
      };
      jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

      await verifyUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Permissions didn't match" });
    });

    it("should return 200 with user name and email when token and user match", async () => {
      mockRes.locals = { jwtData: { id: "valid_id", email: "valid@test.com" } };
      const mockUser = {
        _id: { toString: () => "valid_id" },
        name: "Valid User",
        email: "valid@test.com",
      };
      jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

      await verifyUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "OK",
        name: "Valid User",
        email: "valid@test.com",
      });
    });

    it("should return 500 if error occurs in verifyUser", async () => {
      mockRes.locals = { jwtData: { id: "err_id" } };
      jest.spyOn(User, "findById").mockRejectedValue(new Error("Verify DB Error") as any);

      await verifyUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "ERROR", cause: "Verify DB Error" })
      );
    });
  });

  describe("userLogout", () => {
    it("should return 401 if user not found on logout", async () => {
      mockRes.locals = { jwtData: { id: "missing_id" } };
      jest.spyOn(User, "findById").mockResolvedValue(null as any);

      await userLogout(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should return 401 if user permissions do not match", async () => {
      mockRes.locals = { jwtData: { id: "req_id" } };
      const mockUser = {
        _id: { toString: () => "other_id" },
        name: "Other",
        email: "other@test.com",
      };
      jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

      await userLogout(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Permissions didn't match" });
    });

    it("should clear cookie and return 200 on successful logout", async () => {
      mockRes.locals = { jwtData: { id: "logged_id" } };
      const mockUser = {
        _id: { toString: () => "logged_id" },
        name: "Logged Out User",
        email: "logged@test.com",
      };
      jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

      await userLogout(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.clearCookie).toHaveBeenCalledWith(COOKIE_NAME, expect.any(Object));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "OK",
        name: "Logged Out User",
        email: "logged@test.com",
      });
    });

    it("should return 500 if error occurs in userLogout", async () => {
      mockRes.locals = { jwtData: { id: "err_id" } };
      jest.spyOn(User, "findById").mockRejectedValue(new Error("Logout error") as any);

      await userLogout(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
