import express from "express";
import taskRoute from "./routes/tasksRouters.js";
import authRoute from "./routes/authRouters.js";
import projectRoute from "./routes/projectsRouters.js";
import profileRoute from "./routes/profileRouters.js";
import collaborationRoute from "./routes/collaborationRouters.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import errorHandler from "./middleware/errorHandler.js";
import http from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import { startReminderCron, startRecurringCron } from "./services/cronJobs.js";

dotenv.config();

// ── Startup validation ────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET chưa được cấu hình trong file .env");
  process.exit(1);
}

if (!process.env.MONGODB) {
  console.error("❌ FATAL: MONGODB connection string chưa được cấu hình trong file .env");
  process.exit(1);
}

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
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

// ── Rate Limiters ─────────────────────────────────────────────────────────────
// Auth: giới hạn 10 lần đăng nhập/đăng ký mỗi 15 phút (chống brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau 15 phút.",
  },
  skip: () => process.env.NODE_ENV === "development", // Bỏ qua rate limit khi dev
});

// API chung: giới hạn 100 request mỗi 15 phút
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
  },
});

// ── Middlewares ───────────────────────────────────────────────────────────────
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

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/tasks", apiLimiter, taskRoute);
app.use("/api/auth", authLimiter, authRoute);
app.use("/api/projects", apiLimiter, projectRoute);
app.use("/api/profile", apiLimiter, profileRoute);
app.use("/api/collaboration", apiLimiter, collaborationRoute);

// Error handler (phải đặt sau tất cả routes)
app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

connectDB().then(() => {
  // Start Cron Jobs
  startReminderCron();
  startRecurringCron();

  server.listen(PORT, () => {
    console.log(`✅ Server đang chạy trên cổng ${PORT} (${process.env.NODE_ENV})`);
  });
});