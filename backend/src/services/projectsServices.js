import Project from "../../models/Project.js";
import Task from "../../models/Task.js";

export const getProjectsService = async (userId) => {
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });
    return projects;
};

export const createProjectService = async (userId, { name, description, color, icon }) => {
    if (!name?.trim()) {
        throw { status: 400, message: "Tên dự án không được để trống" };
    }
    if (name.trim().length > 100) {
        throw { status: 400, message: "Tên dự án không được vượt quá 100 ký tự" };
    }

    const project = await Project.create({
        userId,
        name: name.trim(),
        description: description?.trim() || "",
        color: color || "#6366f1",
        icon: icon || "📁",
    });

    return project;
};

export const updateProjectService = async (userId, projectId, updates) => {
    const { name, description, color, icon } = updates;

    if (name !== undefined && !name?.trim()) {
        throw { status: 400, message: "Tên dự án không được để trống" };
    }

    const project = await Project.findOneAndUpdate(
        { _id: projectId, userId },
        {
            ...(name && { name: name.trim() }),
            ...(description !== undefined && { description: description.trim() }),
            ...(color && { color }),
            ...(icon && { icon }),
        },
        { new: true }
    );

    if (!project) {
        throw { status: 404, message: "Dự án không tồn tại" };
    }

    return project;
};

export const deleteProjectService = async (userId, projectId) => {
    const project = await Project.findOneAndDelete({ _id: projectId, userId });
    if (!project) {
        throw { status: 404, message: "Dự án không tồn tại" };
    }

    // Gỡ projectId khỏi tất cả tasks liên quan
    await Task.updateMany({ userId, projectId }, { $set: { projectId: null } });

    return { message: "Đã xóa dự án" };
};
