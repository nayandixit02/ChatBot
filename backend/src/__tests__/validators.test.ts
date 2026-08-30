import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import {
  validate,
  loginValidator,
  signupValidator,
  chatCompletionValidator,
} from "../utils/validators.js";

describe("Validators Unit Tests", () => {
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    };
    mockNext = jest.fn() as any;
  });

  describe("loginValidator", () => {
    it("should pass validation with valid email and password (>= 6 chars)", async () => {
      const mockReq = {
        body: {
          email: "test@example.com",
          password: "password123",
        },
      } as unknown as Request;

      const middleware = validate(loginValidator);
      await middleware(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should fail validation with invalid email format", async () => {
      const mockReq = {
        body: {
          email: "invalid-email-format",
          password: "password123",
        },
      } as unknown as Request;

      const middleware = validate(loginValidator);
      await middleware(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ msg: "valid mail is required" }),
          ]),
        })
      );
    });

    it("should fail validation if password is shorter than 6 characters", async () => {
      const mockReq = {
        body: {
          email: "test@example.com",
          password: "123",
        },
      } as unknown as Request;

      const middleware = validate(loginValidator);
      await middleware(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              msg: "Password should contains atleast 6 characters",
            }),
          ]),
        })
      );
    });
  });

  describe("signupValidator", () => {
    it("should pass validation with valid name, email, and password", async () => {
      const mockReq = {
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "securepassword",
        },
      } as unknown as Request;

      const middleware = validate(signupValidator);
      await middleware(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should fail validation if name is empty", async () => {
      const mockReq = {
        body: {
          name: "",
          email: "john@example.com",
          password: "securepassword",
        },
      } as unknown as Request;

      const middleware = validate(signupValidator);
      await middleware(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ msg: "Name is required" }),
          ]),
        })
      );
    });
  });

  describe("chatCompletionValidator", () => {
    it("should pass validation when message is provided", async () => {
      const mockReq = {
        body: {
          message: "Hello chatbot, how are you?",
        },
      } as unknown as Request;

      const middleware = validate(chatCompletionValidator);
      await middleware(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should fail validation when message is empty", async () => {
      const mockReq = {
        body: {
          message: "",
        },
      } as unknown as Request;

      const middleware = validate(chatCompletionValidator);
      await middleware(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ msg: "Message  is required" }),
          ]),
        })
      );
    });
  });
});
