import mongoose from "mongoose";
import Task from "../../models/Task.js";

export const getAllTasksService = async (userId, filter) => {
    const now = new Date();
    let startDate;

    switch (filter) {
        case "today": {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        }
        case "week": {
            const mondayDate =
                now.getDate() - (now.getDay() - 1) - (now.getDay() === 0 ? 7 : 0);
            startDate = new Date(now.getFullYear(), now.getMonth(), mondayDate);
            break;
        }
        case "month": {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        }
        case "all":
        default: {
            startDate = null;
        }
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const query = startDate ? { userId: userIdObj, createdAt: { $gte: startDate } } : { userId: userIdObj };

    const result = await Task.aggregate([
        { $match: query },
        {
            $facet: {
            tasks: [{ $sort: { order: 1, createdAt: -1 } }],
            activeCount: [{ $match: { status: "active" } }, { $count: "count" }],
            completeCount: [{ $match: { status: "complete" } }, { $count: "count" }],
            },
        },
    ]);

    const tasks = result[0].tasks;
    const activeCount = result[0].activeCount[0]?.count || 0;
    const completeCount = result[0].completeCount[0]?.count || 0;

    return { tasks, activeCount, completeCount };
};

export const createTaskService = async (userId, taskData) => {
    const { title, priority, dueDate, tags, subTasks } = taskData;

    if (!title || !title.trim()) {
        throw { status: 400, message: "Tiêu đề không được để trống." };
    }

    if (title.trim().length > 200) {
        throw { status: 400, message: "Tiêu đề không được vượt quá 200 ký tự." };
    }

    const task = new Task({ 
        title: title.trim(), 
        userId,
        priority: priority || "medium",
        dueDate: dueDate || null,
        tags: tags || [],
        subTasks: subTasks || [],
        order: -Date.now()
    });

    const newTask = await task.save();
    return newTask;
};

export const updateTaskService = async (userId, taskId, taskData) => {
    const { title, status, completedAt, priority, dueDate, tags, subTasks } = taskData;

    if (title !== undefined && (!title || !title.trim())) {
        throw { status: 400, message: "Tiêu đề không được để trống." };
    }

    if (title && title.trim().length > 200) {
        throw { status: 400, message: "Tiêu đề không được vượt quá 200 ký tự." };
    }

    const updatedTask = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        {
            title: title?.trim(),
            status,
            completedAt,
            ...(priority && { priority }),
            ...(dueDate !== undefined && { dueDate }),
            ...(tags && { tags }),
            ...(subTasks && { subTasks }),
        },
        { new: true }
    );

    if (!updatedTask) {
        throw { status: 404, message: "Nhiệm vụ không tồn tại" };
    }

    return updatedTask;
};

export const deleteTaskService = async (userId, taskId) => {
    const deletedTask = await Task.findOneAndDelete({ _id: taskId, userId });

    if (!deletedTask) {
        throw { status: 404, message: "Nhiệm vụ không tồn tại" };
    }

    return deletedTask;
};

export const reorderTasksService = async (userId, items) => {
    if (!Array.isArray(items)) {
        throw { status: 400, message: "Dữ liệu không hợp lệ" };
    }

    const bulkOps = items.map(item => ({
        updateOne: {
            filter: { _id: item.id, userId },
            update: { order: item.order }
        }
    }));

    if (bulkOps.length > 0) {
        await Task.bulkWrite(bulkOps);
    }
    
    return { message: "Cập nhật thứ tự thành công" };
};
