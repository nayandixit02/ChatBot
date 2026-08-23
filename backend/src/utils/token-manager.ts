import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

export const createToken = (
  id: string,
  email: string,
  expiresIn: string | number
) => {
  const payload = { id, email };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: expiresIn as any,
  });
  return token;
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Accept token from cookie or Authorization header as fallback
  const cookieToken = req.cookies?.[`${COOKIE_NAME}`];
  const authHeader = req.headers?.authorization;
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  const token = cookieToken || headerToken;
  if (!token || (typeof token === "string" && token.trim() === "")) {
    return res.status(401).json({ message: "Token Not Received" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    res.locals.jwtData = decoded;
    return next();
  } catch (err: any) {
    return res.status(401).json({
      message: "Token Expired or Invalid",
      cause: err?.message,
    });
  }
};
