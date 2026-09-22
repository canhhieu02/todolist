import User from "../../models/User.js";
import Task from "../../models/Task.js";
import bcrypt from "bcryptjs";

export const getProfileService = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) throw { status: 404, message: "Người dùng không tồn tại" };
    return user;
};

export const updateProfileService = async (userId, { name, bio, avatar, emailReminders }) => {
    if (name !== undefined && !name?.trim()) {
        throw { status: 400, message: "Tên không được để trống" };
    }
    if (name && name.trim().length > 100) {
        throw { status: 400, message: "Tên không được vượt quá 100 ký tự" };
    }
    if (bio && bio.length > 300) {
        throw { status: 400, message: "Bio không được vượt quá 300 ký tự" };
    }

    // Validate base64 avatar (optional)
    if (avatar && !avatar.startsWith("data:image/")) {
        throw { status: 400, message: "Định dạng avatar không hợp lệ" };
    }

    const user = await User.findByIdAndUpdate(
        userId,
        {
            ...(name && { name: name.trim() }),
            ...(bio !== undefined && { bio }),
            ...(avatar !== undefined && { avatar }),
            ...(emailReminders !== undefined && { emailReminders }),
        },
        { new: true }
    ).select("-password");

    if (!user) throw { status: 404, message: "Người dùng không tồn tại" };
    return user;
};

export const changePasswordService = async (userId, { currentPassword, newPassword }) => {
    if (!currentPassword || !newPassword) {
        throw { status: 400, message: "Vui lòng nhập đầy đủ thông tin" };
    }
    if (newPassword.length < 6) {
        throw { status: 400, message: "Mật khẩu mới phải có ít nhất 6 ký tự" };
    }
    if (newPassword.length > 128) {
        throw { status: 400, message: "Mật khẩu không được vượt quá 128 ký tự" };
    }

    const user = await User.findById(userId);
    if (!user) throw { status: 404, message: "Người dùng không tồn tại" };

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw { status: 400, message: "Mật khẩu hiện tại không đúng" };
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: "Đổi mật khẩu thành công" };
};

export const exportDataService = async (userId, format = "json") => {
    const tasks = await Task.find({ userId })
        .populate("projectId", "name color")
        .sort({ createdAt: -1 })
        .lean();

    if (format === "csv") {
        const header = "ID,Title,Description,Status,Priority,DueDate,Tags,Project,CreatedAt,CompletedAt";
        const rows = tasks.map(t => [
            t._id,
            `"${(t.title || "").replace(/"/g, '""')}"`,
            `"${(t.description || "").replace(/"/g, '""')}"`,
            t.status,
            t.priority,
            t.dueDate ? new Date(t.dueDate).toLocaleDateString("vi-VN") : "",
            `"${(t.tags || []).join(", ")}"`,
            t.projectId?.name || "",
            new Date(t.createdAt).toLocaleDateString("vi-VN"),
            t.completedAt ? new Date(t.completedAt).toLocaleDateString("vi-VN") : "",
        ].join(",")).join("\n");
        
        return `${header}\n${rows}`;
    }

    return tasks;
};
