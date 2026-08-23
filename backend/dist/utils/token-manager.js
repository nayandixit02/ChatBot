import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";
export const createToken = (id, email, expiresIn) => {
    const payload = { id, email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: expiresIn,
    });
    return token;
};
export const verifyToken = async (req, res, next) => {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.jwtData = decoded;
        return next();
    }
    catch (err) {
        return res.status(401).json({
            message: "Token Expired or Invalid",
            cause: err?.message,
        });
    }
};
//# sourceMappingURL=token-manager.js.map