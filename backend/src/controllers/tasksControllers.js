import { 
    getAllTasksService, 
    createTaskService, 
    updateTaskService, 
    deleteTaskService, 
    reorderTasksService,
    addSubTaskService,
    toggleSubTaskService,
    deleteSubTaskService,
} from "../services/tasksServices.js";

// ── Task Controllers ───────────────────────────────────────────────────────────
// Tất cả dùng next(error) để đẩy lỗi lên errorHandler middleware

export const getAllTasks = async (req, res, next) => {
    try {
        const {
            filter = "all",   // date filter: today | week | month | all
            status = "all",   // status filter: active | completed | all
            page = 1,         // trang hiện tại
            limit = 10,       // số task mỗi trang
        } = req.query;
        const result = await getAllTasksService(req.user.id, filter, status, page, limit);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const createTask = async (req, res, next) => {
    try {
        const newTask = await createTaskService(req.user.id, req.body);
        req.app.get("io")?.to(req.user.id).emit("task_changed");
        res.status(201).json(newTask);
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const updatedTask = await updateTaskService(req.user.id, req.params.id, req.body);
        req.app.get("io")?.to(req.user.id).emit("task_changed");
        res.status(200).json(updatedTask);
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req, res, next) => {
    try {
        const deletedTask = await deleteTaskService(req.user.id, req.params.id);
        req.app.get("io")?.to(req.user.id).emit("task_changed");
        res.status(200).json(deletedTask);
    } catch (error) {
        next(error);
    }
};

export const reorderTasks = async (req, res, next) => {
    try {
        const result = await reorderTasksService(req.user.id, req.body.items);
        req.app.get("io")?.to(req.user.id).emit("task_changed");
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// ── SubTask Controllers ────────────────────────────────────────────────────────
// Dùng MongoDB atomic operators ($push, $set positional, $pull) thay vì ghi đè toàn bộ array

/**
 * POST /tasks/:id/subtasks
 * Thêm một subtask mới vào task (dùng $push — chỉ gửi title mới)
 */
export const addSubTask = async (req, res, next) => {
    try {
        const updatedTask = await addSubTaskService(req.user.id, req.params.id, req.body.title);
        req.app.get("io")?.to(req.user.id).emit("task_changed");
        res.status(201).json(updatedTask);
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /tasks/:id/subtasks/:subId/toggle
 * Đảo trạng thái isCompleted của subtask (dùng $set positional — atomic, không ghi đè array)
 */
export const toggleSubTask = async (req, res, next) => {
    try {
        const updatedTask = await toggleSubTaskService(req.user.id, req.params.id, req.params.subId);
        req.app.get("io")?.to(req.user.id).emit("task_changed");
        res.status(200).json(updatedTask);
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /tasks/:id/subtasks/:subId
 * Xóa một subtask khỏi task (dùng $pull — chỉ gửi subId cần xóa)
 */
export const deleteSubTask = async (req, res, next) => {
    try {
        const updatedTask = await deleteSubTaskService(req.user.id, req.params.id, req.params.subId);
        req.app.get("io")?.to(req.user.id).emit("task_changed");
        res.status(200).json(updatedTask);
    } catch (error) {
        next(error);
    }
};