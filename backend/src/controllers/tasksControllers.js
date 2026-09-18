import mongoose from "mongoose";
import Task from "../../models/Task.js";

export const getAllTasks = async (req, res) => {
    const { filter = "today" } = req.query;
    const now = new Date();
    let startDate;

    switch (filter) {
        case "today": {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 2025-08-24 00:00
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

    const userIdObj = new mongoose.Types.ObjectId(req.user.id);
    const query = startDate ? { userId: userIdObj, createdAt: { $gte: startDate } } : { userId: userIdObj };


    try {
        const result = await Task.aggregate([
            { $match: query },
            {
                $facet: {
                tasks: [{ $sort: { createdAt: -1 } }],
                activeCount: [{ $match: { status: "active" } }, { $count: "count" }],
                completeCount: [{ $match: { status: "complete" } }, { $count: "count" }],
                },
            },
        ]);

        const tasks = result[0].tasks;
        const activeCount = result[0].activeCount[0]?.count || 0;
        const completeCount = result[0].completeCount[0]?.count || 0;

        res.status(200).json({ tasks, activeCount, completeCount });
    } catch (error) {
        console.error("lỗi khi gọi getAllTasks", error);
        res.status(500).json({ message: "lỗi hệ thống" });
    }
};

export const createTask = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Tiêu đề không được để trống." });
        }

        if (title.trim().length > 200) {
            return res.status(400).json({ message: "Tiêu đề không được vượt quá 200 ký tự." });
        }

        const task = new Task({ title: title.trim(), userId: req.user.id });

        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (error) {
        console.error("Lỗi khi gọi createTask", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }

};

export const updateTask = async(req, res) => {
    try {
        const { title, status, completedAt } = req.body;

        if (title !== undefined && (!title || !title.trim())) {
            return res.status(400).json({ message: "Tiêu đề không được để trống." });
        }

        if (title && title.trim().length > 200) {
            return res.status(400).json({ message: "Tiêu đề không được vượt quá 200 ký tự." });
        }

        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            {
                title: title?.trim(),
                status,
                completedAt,
            },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Nhiệm vụ không tồn tại" });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Lỗi khi gọi updateTask", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }

};

export const deleteTask = async(req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

        if (!deletedTask) {
            return res.status(404).json({ message: "Nhiệm vụ không tồn tại" });
        }

        res.status(200).json(deletedTask);
    } catch (error) {
        console.error("Lỗi khi gọi updateTask", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};