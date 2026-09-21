import mongoose from "mongoose";

const subTaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  isCompleted: { type: Boolean, default: false }
});

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "complete"],
      default: "active",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    subTasks: {
      type: [subTaskSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true, // createdAt và updatedAt tự động thêm vào
  }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;