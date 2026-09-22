import express from "express";
import {
  createTask,
  deleteTask,
  getAllTasks,
  updateTask,
  reorderTasks,
  addSubTask,
  toggleSubTask,
  deleteSubTask,
} from "../controllers/tasksControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả các route bên dưới đều cần xác thực
router.use(authMiddleware);

// ── Task routes ───────────────────────────────────────────────────────────────
router.get("/", getAllTasks);
router.post("/", createTask);
router.put("/reorder", reorderTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

// ── SubTask routes (atomic — không ghi đè toàn bộ array) ──────────────────────
// POST   /tasks/:id/subtasks              — thêm subtask mới ($push)
// PATCH  /tasks/:id/subtasks/:subId/toggle — toggle isCompleted ($set positional)
// DELETE /tasks/:id/subtasks/:subId        — xóa subtask ($pull)
router.post("/:id/subtasks", addSubTask);
router.patch("/:id/subtasks/:subId/toggle", toggleSubTask);
router.delete("/:id/subtasks/:subId", deleteSubTask);

export default router;