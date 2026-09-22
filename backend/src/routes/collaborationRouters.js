import express from "express";
import {
    searchTasks,
    shareTask,
    unshareTask,
    getSharedTasks,
    getComments,
    addComment,
    deleteComment,
} from "../controllers/collaborationControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Advanced Search
router.get("/search", searchTasks);

// Shared Tasks
router.get("/shared", getSharedTasks);

// Task Sharing
router.post("/:id/share", shareTask);
router.delete("/:id/share/:userId", unshareTask);

// Task Comments
router.get("/:id/comments", getComments);
router.post("/:id/comments", addComment);
router.delete("/comments/:commentId", deleteComment);

export default router;
