import Task from "../../models/Task.js";
import User from "../../models/User.js";
import Comment from "../../models/Comment.js";

/**
 * Full-text search + combined filters
 */
export const searchTasksService = async (userId, params) => {
    const { q, projectId, priority, status, dateFrom, dateTo, tags, page = 1, limit = 10 } = params;

    const conditions = [{ 
        $or: [
            { userId: userId },
            { sharedWith: userId } // tasks được share
        ]
    }];

    // Full-text search
    if (q?.trim()) {
        conditions.push({
            $or: [
                { $text: { $search: q.trim() } },
                { title: { $regex: q.trim(), $options: "i" } },
                { description: { $regex: q.trim(), $options: "i" } },
            ]
        });
    }

    if (projectId) conditions.push({ projectId });
    if (priority) conditions.push({ priority });
    if (status) conditions.push({ status: status === "completed" ? "complete" : status });

    if (dateFrom || dateTo) {
        const dateFilter = {};
        if (dateFrom) dateFilter.$gte = new Date(dateFrom);
        if (dateTo) dateFilter.$lte = new Date(dateTo);
        conditions.push({ dueDate: dateFilter });
    }

    if (tags) {
        const tagList = Array.isArray(tags) ? tags : [tags];
        conditions.push({ tags: { $in: tagList } });
    }

    const matchQuery = conditions.length > 1 ? { $and: conditions } : conditions[0];
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
        Task.find(matchQuery)
            .populate("projectId", "name color icon")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Task.countDocuments(matchQuery),
    ]);

    return { tasks, total, totalPages: Math.ceil(total / limitNum), currentPage: pageNum };
};

/**
 * Chia sẻ task với người dùng khác qua email
 */
export const shareTaskService = async (ownerId, taskId, email) => {
    const task = await Task.findOne({ _id: taskId, userId: ownerId });
    if (!task) throw { status: 404, message: "Nhiệm vụ không tồn tại" };

    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) throw { status: 404, message: "Không tìm thấy người dùng với email này" };
    if (targetUser._id.toString() === ownerId.toString()) {
        throw { status: 400, message: "Không thể chia sẻ với chính mình" };
    }

    // Thêm vào sharedWith nếu chưa có
    if (!task.sharedWith.includes(targetUser._id)) {
        task.sharedWith.push(targetUser._id);
        await task.save();
    }

    return { message: `Đã chia sẻ với ${targetUser.name}`, user: { name: targetUser.name, email: targetUser.email } };
};

export const unshareTaskService = async (ownerId, taskId, targetUserId) => {
    const task = await Task.findOneAndUpdate(
        { _id: taskId, userId: ownerId },
        { $pull: { sharedWith: targetUserId } },
        { new: true }
    );
    if (!task) throw { status: 404, message: "Nhiệm vụ không tồn tại" };
    return task;
};

/**
 * Lấy tasks được chia sẻ với mình
 */
export const getSharedTasksService = async (userId) => {
    const tasks = await Task.find({ sharedWith: userId })
        .populate("userId", "name avatar")
        .populate("projectId", "name color icon")
        .sort({ createdAt: -1 })
        .lean();
    return tasks;
};

/**
 * Comment CRUD
 */
export const getCommentsService = async (userId, taskId) => {
    // Kiểm tra user có quyền xem task không
    const task = await Task.findOne({
        _id: taskId,
        $or: [{ userId }, { sharedWith: userId }]
    });
    if (!task) throw { status: 403, message: "Không có quyền truy cập" };

    const comments = await Comment.find({ taskId })
        .populate("userId", "name avatar")
        .sort({ createdAt: 1 });
    return comments;
};

export const addCommentService = async (userId, taskId, content) => {
    if (!content?.trim()) throw { status: 400, message: "Nội dung bình luận không được để trống" };
    if (content.trim().length > 1000) throw { status: 400, message: "Bình luận không được vượt quá 1000 ký tự" };

    const task = await Task.findOne({
        _id: taskId,
        $or: [{ userId }, { sharedWith: userId }]
    });
    if (!task) throw { status: 403, message: "Không có quyền truy cập" };

    const comment = await Comment.create({ taskId, userId, content: content.trim() });
    await comment.populate("userId", "name avatar");
    return comment;
};

export const deleteCommentService = async (userId, commentId) => {
    const comment = await Comment.findOneAndDelete({ _id: commentId, userId });
    if (!comment) throw { status: 404, message: "Bình luận không tồn tại hoặc không có quyền xóa" };
    return { message: "Đã xóa bình luận" };
};
