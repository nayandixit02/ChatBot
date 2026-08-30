import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createToken, verifyToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";

describe("Token Manager Unit Tests", () => {
  const secret = process.env.JWT_SECRET || "test_jwt_secret_key_123456789";

  describe("createToken", () => {
    it("should create a valid signed JWT containing id and email", () => {
      const id = "user123";
      const email = "user@test.com";
      const token = createToken(id, email, "1h");

      expect(typeof token).toBe("string");
      const decoded = jwt.verify(token, secret) as { id: string; email: string };
      expect(decoded.id).toBe(id);
      expect(decoded.email).toBe(email);
    });

    it("should support numeric expiresIn durations", () => {
      const token = createToken("u1", "u1@test.com", 3600);
      expect(typeof token).toBe("string");
      const decoded = jwt.verify(token, secret) as { id: string; email: string };
      expect(decoded.id).toBe("u1");
    });
  });

  describe("verifyToken middleware", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
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

    it("should return 401 if no token is in cookie or authorization header", async () => {
      mockReq.cookies = {};
      mockReq.headers = {};

      await verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Token Not Received" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token is empty or whitespace only", async () => {
      mockReq.cookies = { [COOKIE_NAME]: "   " };

      await verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Token Not Received" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should verify valid token from cookies, set res.locals.jwtData, and call next()", async () => {
      const validToken = jwt.sign({ id: "user_abc", email: "abc@test.com" }, secret, {
        expiresIn: "1h",
      });
      mockReq.cookies = { [COOKIE_NAME]: validToken };

      await verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.locals?.jwtData).toBeDefined();
      expect(mockRes.locals?.jwtData.id).toBe("user_abc");
      expect(mockRes.locals?.jwtData.email).toBe("abc@test.com");
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should verify valid token from Authorization Bearer header as fallback", async () => {
      const validToken = jwt.sign({ id: "user_bearer", email: "bearer@test.com" }, secret, {
        expiresIn: "1h",
      });
      mockReq.cookies = {};
      mockReq.headers = { authorization: `Bearer ${validToken}` };

      await verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.locals?.jwtData).toBeDefined();
      expect(mockRes.locals?.jwtData.id).toBe("user_bearer");
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should return 401 when token is invalid or corrupted", async () => {
      mockReq.cookies = { [COOKIE_NAME]: "invalid.jwt.token" };

      await verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Token Expired or Invalid",
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when token is expired", async () => {
      const expiredToken = jwt.sign({ id: "expired_user", email: "exp@test.com" }, secret, {
        expiresIn: "-1s",
      });
      mockReq.cookies = { [COOKIE_NAME]: expiredToken };

      await verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Token Expired or Invalid",
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
