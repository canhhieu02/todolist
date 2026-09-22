import cron from "node-cron";
import Task from "../../models/Task.js";
import User from "../../models/User.js";
import { sendReminderEmail } from "./emailService.js";

/**
 * Cron job nhắc nhở email — chạy mỗi giờ
 * Tìm tasks có dueDate trong 24 giờ tới và gửi email
 */
export const startReminderCron = () => {
    // Chạy mỗi giờ vào phút 0
    cron.schedule("0 * * * *", async () => {
        try {
            const now = new Date();
            const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            const tasksDueSoon = await Task.find({
                status: "active",
                dueDate: { $gte: now, $lte: in24h },
                // Tránh gửi quá nhiều — chỉ gửi cho tasks chưa bị nhắc
            }).populate("userId", "name email emailReminders");

            for (const task of tasksDueSoon) {
                const user = task.userId;
                if (!user?.email || !user?.emailReminders) continue;

                await sendReminderEmail({
                    toEmail: user.email,
                    toName: user.name,
                    taskTitle: task.title,
                    dueDate: task.dueDate,
                });
            }

            if (tasksDueSoon.length > 0) {
                console.log(`📧 Đã gửi ${tasksDueSoon.length} email nhắc nhở deadline`);
            }
        } catch (error) {
            console.error("❌ Lỗi reminder cron:", error.message);
        }
    });

    console.log("⏰ Reminder cron job đã khởi động (mỗi giờ)");
};

/**
 * Cron job recurring tasks — chạy mỗi ngày lúc 00:05
 * Tự tạo task mới từ task recurring đã đến hạn
 */
export const startRecurringCron = () => {
    cron.schedule("5 0 * * *", async () => {
        try {
            const now = new Date();

            const recurringTasks = await Task.find({
                recurrence: { $ne: null },
                "recurrence.nextDueDate": { $lte: now },
                $or: [
                    { "recurrence.endDate": null },
                    { "recurrence.endDate": { $gte: now } }
                ]
            });

            for (const task of recurringTasks) {
                const { type, interval, endDate } = task.recurrence;

                // Tạo task mới từ template
                await Task.create({
                    userId: task.userId,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    tags: task.tags,
                    projectId: task.projectId,
                    dueDate: task.recurrence.nextDueDate,
                    status: "active",
                    order: -Date.now(),
                });

                // Tính nextDueDate tiếp theo
                const next = new Date(task.recurrence.nextDueDate);
                if (type === "daily") next.setDate(next.getDate() + interval);
                else if (type === "weekly") next.setDate(next.getDate() + 7 * interval);
                else if (type === "monthly") next.setMonth(next.getMonth() + interval);

                // Cập nhật nextDueDate của task gốc
                if (!endDate || next <= endDate) {
                    task.recurrence.nextDueDate = next;
                    await task.save();
                } else {
                    // Đã hết hạn lặp — xóa recurrence
                    task.recurrence = null;
                    await task.save();
                }
            }

            if (recurringTasks.length > 0) {
                console.log(`🔄 Đã tạo ${recurringTasks.length} recurring tasks`);
            }
        } catch (error) {
            console.error("❌ Lỗi recurring cron:", error.message);
        }
    });

    console.log("🔄 Recurring tasks cron job đã khởi động (mỗi ngày 00:05)");
};
