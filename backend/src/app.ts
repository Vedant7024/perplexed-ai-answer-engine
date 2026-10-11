
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL,
    ].filter((url): url is string => Boolean(url)),
  })
);

app.use(express.json());

app.use("/api", chatRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
