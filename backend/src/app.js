import express from "express";
import taskRoute from "./routes/tasksRouters.js";
import { connectDB } from "./config/db.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
});

app.use("/api/tasks", taskRoute);

export default app;
