import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.use("/api", chatRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;