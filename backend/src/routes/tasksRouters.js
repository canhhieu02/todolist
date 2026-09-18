import express from "express";
import {
  createTask,
  deleteTask,
  getAllTasks,
  updateTask,
} from "../controllers/tasksControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả các route bên dưới đều cần xác thực
router.use(authMiddleware);

router.get("/", getAllTasks);

router.post("/", createTask);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

export default router;