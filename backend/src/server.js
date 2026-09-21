import express from "express";
import taskRoute from "./routes/tasksRouters.js";
import authRoute from "./routes/authRouters.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import errorHandler from "./middleware/errorHandler.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);

// Cấu hình Socket.io với CORS chung cho development
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
    credentials: true,
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join_room", (userId) => {
    socket.join(userId);
  });
});

// middlewares
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  // Production: chỉ cho phép frontend domain cụ thể
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }));
} else {
  // Development: cho phép mọi port của localhost
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
    credentials: true,
  }));
}

app.use("/api/tasks", taskRoute);
app.use("/api/auth", authRoute);

// Error handler (phải đặt sau tất cả routes)
app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`server bắt đầu trên cổng ${PORT}`);
  });
});