import { Router } from "express";
import userRoutes from "./user-routes.js";
import chatRoutes from "./chats-routes.js";

const appRouter = Router();

appRouter.use("/user", userRoutes); // domain/api/v1/user
appRouter.use("/chat", chatRoutes); // domain/api/v1/chat
appRouter.use("/chats", chatRoutes); // domain/api/v1/chats

export default appRouter;
