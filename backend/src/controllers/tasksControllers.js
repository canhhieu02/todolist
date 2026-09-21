import { 
    getAllTasksService, 
    createTaskService, 
    updateTaskService, 
    deleteTaskService, 
    reorderTasksService 
} from "../services/tasksServices.js";

export const getAllTasks = async (req, res) => {
    try {
        const { filter = "today" } = req.query;
        const result = await getAllTasksService(req.user.id, filter);
        res.status(200).json(result);
    } catch (error) {
        console.error("lỗi khi gọi getAllTasks", error);
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        res.status(500).json({ message: "lỗi hệ thống" });
    }
};

export const createTask = async (req, res) => {
    try {
        const newTask = await createTaskService(req.user.id, req.body);
        req.app.get("io")?.to(req.user.id).emit("task_changed");
        res.status(201).json(newTask);
    } catch (error) {
        console.error("Lỗi khi gọi createTask", error);
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const updateTask = async(req, res) => {
    try {
        const updatedTask = await updateTaskService(req.user.id, req.params.id, req.body);
        req.app.get("io")?.to(req.user.id).emit("task_changed");
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Lỗi khi gọi updateTask", error);
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const deleteTask = async(req, res) => {
    try {
        const deletedTask = await deleteTaskService(req.user.id, req.params.id);
        req.app.get("io")?.to(req.user.id).emit("task_changed");
        res.status(200).json(deletedTask);
    } catch (error) {
        console.error("Lỗi khi gọi deleteTask", error);
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const reorderTasks = async (req, res) => {
    try {
        const result = await reorderTasksService(req.user.id, req.body.items);
        req.app.get("io")?.to(req.user.id).emit("task_changed");
        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi gọi reorderTasks", error);
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};