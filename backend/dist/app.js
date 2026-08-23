import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
config();
const app = express();
// middlewares
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5000",
    process.env.FRONTEND_URL,
    "https://chatbot-8y9v.onrender.com",
].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server) or listed origins
        if (!origin ||
            allowedOrigins.includes(origin) ||
            origin.endsWith(".onrender.com")) {
            callback(null, true);
        }
        else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}
app.use("/api/v1", appRouter);
export default app;
//# sourceMappingURL=app.js.map