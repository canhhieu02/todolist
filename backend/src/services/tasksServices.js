import mongoose from "mongoose";
import Task from "../../models/Task.js";

export const getAllTasksService = async (userId, filter, status = "all", page = 1, limit = 10, projectId = null) => {
    const now = new Date();
    let startDate = null;
    let endDate = null;

    switch (filter) {
        case "today": {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        }
        case "week": {
            // Tính ngày thứ 2 đầu tuần (ISO: tuần bắt đầu từ Monday)
            const dayOfWeek = now.getDay(); // 0=CN, 1=T2, ..., 6=T7
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
            endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
        }
        case "month": {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
        }
        case "all":
        default: {
            startDate = null;
            endDate = null;
        }
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);

    // Giới hạn page và limit để tránh input bất hợp lệ
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // ── Build match query ────────────────────────────────────────────────────
    // Bộ lọc ngày: ưu tiên dueDate, fallback sang createdAt (khi task không có deadline)
    // VD "hôm nay": tasks có dueDate hôm nay, HOẶC tasks không có dueDate tạo hôm nay
    const conditions = [{ userId: userIdObj }];

    // Lọc theo dự án (nếu có)
    if (projectId) {
        conditions.push({ projectId: new mongoose.Types.ObjectId(projectId) });
    }

    if (startDate && endDate) {
        conditions.push({
            $or: [
                { dueDate: { $gte: startDate, $lt: endDate } },          // có deadline trong khoảng
                { dueDate: null, createdAt: { $gte: startDate, $lt: endDate } } // không deadline, tạo trong khoảng
            ]
        });
    }

    const dateMatchQuery = conditions.length > 1
        ? { $and: conditions }
        : conditions[0];

    // Bộ lọc trạng thái (active / completed / all) — chỉ ảnh hưởng tasks hiển thị
    const statusFilter = status === "active"    ? { status: "active" }
                       : status === "completed" ? { status: "complete" }
                       : {};

    // ── Aggregation ──────────────────────────────────────────────────────────
    const result = await Task.aggregate([
        { $match: dateMatchQuery },
        {
            $facet: {
                // Tasks hiển thị: lọc status + sắp xếp + phân trang server-side
                tasks: [
                    { $match: statusFilter },
                    { $sort: { order: 1, createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limitNum }
                ],
                // Tổng số tasks sau khi lọc status (để tính totalPages đúng)
                total: [
                    { $match: statusFilter },
                    { $count: "count" }
                ],
                // Đếm active/complete — luôn tính trên toàn bộ date range, không theo status filter
                activeCount: [{ $match: { status: "active" } }, { $count: "count" }],
                completeCount: [{ $match: { status: "complete" } }, { $count: "count" }],
            },
        },
    ]);

    let tasks = result[0].tasks;
    await Task.populate(tasks, { path: "projectId", select: "name color icon" });

    const total = result[0].total[0]?.count || 0;
    const activeCount = result[0].activeCount[0]?.count || 0;
    const completeCount = result[0].completeCount[0]?.count || 0;
    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    return { tasks, activeCount, completeCount, total, totalPages, currentPage: pageNum };
};

export const createTaskService = async (userId, taskData) => {
    const { title, description, priority, dueDate, tags, subTasks, projectId, recurrence } = taskData;

    if (!title || !title.trim()) {
        throw { status: 400, message: "Tiêu đề không được để trống." };
    }

    if (title.trim().length > 200) {
        throw { status: 400, message: "Tiêu đề không được vượt quá 200 ký tự." };
    }

    const task = new Task({ 
        title: title.trim(), 
        description: description?.trim() || "",
        userId,
        priority: priority || "medium",
        dueDate: dueDate || null,
        tags: tags || [],
        subTasks: subTasks || [],
        projectId: projectId || null,
        recurrence: recurrence || null,
        order: -Date.now()
    });

    const newTask = await task.save();
    return newTask;
};

export const updateTaskService = async (userId, taskId, taskData) => {
    const { title, description, status, completedAt, priority, dueDate, tags, subTasks, projectId, recurrence } = taskData;

    if (title !== undefined && (!title || !title.trim())) {
        throw { status: 400, message: "Tiêu đề không được để trống." };
    }

    if (title && title.trim().length > 200) {
        throw { status: 400, message: "Tiêu đề không được vượt quá 200 ký tự." };
    }

    const updatedTask = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        {
            ...(title !== undefined && { title: title.trim() }),
            ...(description !== undefined && { description: description.trim() }),
            ...(status !== undefined && { status }),
            ...(completedAt !== undefined && { completedAt }),
            ...(priority !== undefined && { priority }),
            ...(dueDate !== undefined && { dueDate }),
            ...(tags !== undefined && { tags }),
            ...(subTasks !== undefined && { subTasks }),
            ...(projectId !== undefined && { projectId }),
            ...(recurrence !== undefined && { recurrence }),
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

// ── SubTask Services (atomic operators) ────────────────────────────────────────

/**
 * Thêm subtask mới bằng $push — chỉ gửi title mới, không ghi đè toàn bộ array
 */
export const addSubTaskService = async (userId, taskId, title) => {
    if (!title?.trim()) {
        throw { status: 400, message: "Tiêu đề nhiệm vụ con không được để trống" };
    }
    if (title.trim().length > 200) {
        throw { status: 400, message: "Tiêu đề nhiệm vụ con không được vượt quá 200 ký tự" };
    }

    const updatedTask = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        { $push: { subTasks: { title: title.trim(), isCompleted: false } } },
        { new: true }
    );

    if (!updatedTask) {
        throw { status: 404, message: "Nhiệm vụ không tồn tại" };
    }

    return updatedTask;
};

/**
 * Toggle isCompleted của subtask bằng $set positional operator — atomic, không ghi đè array
 */
export const toggleSubTaskService = async (userId, taskId, subTaskId) => {
    // Đọc giá trị hiện tại để flip
    const task = await Task.findOne({ _id: taskId, userId }, { subTasks: 1 });

    if (!task) {
        throw { status: 404, message: "Nhiệm vụ không tồn tại" };
    }

    const subTask = task.subTasks.id(subTaskId);
    if (!subTask) {
        throw { status: 404, message: "Nhiệm vụ con không tồn tại" };
    }

    // Dùng positional operator $ để chỉ cập nhật đúng 1 phần tử trong array
    const updatedTask = await Task.findOneAndUpdate(
        { _id: taskId, userId, "subTasks._id": subTaskId },
        { $set: { "subTasks.$.isCompleted": !subTask.isCompleted } },
        { new: true }
    );

    return updatedTask;
};

/**
 * Xóa subtask bằng $pull — chỉ gửi subTaskId, không ghi đè array
 */
export const deleteSubTaskService = async (userId, taskId, subTaskId) => {
    const updatedTask = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        { $pull: { subTasks: { _id: subTaskId } } },
        { new: true }
    );

    if (!updatedTask) {
        throw { status: 404, message: "Nhiệm vụ không tồn tại" };
    }

    return updatedTask;
};
