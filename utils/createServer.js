import express from "express";
import dotenv from "dotenv";
dotenv.config();
import authRouter from "../routes/authRoutes.js";
import taskRouter from "../routes/taskRoutes.js";
import notFoundMiddleware from "../middleware/not-found.js";
import errorHandlerMiddleware from "../middleware/error-handler.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";

function createServer() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser(process.env.JWT_SECRET));
  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/task", taskRouter);

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}

export default createServer;
