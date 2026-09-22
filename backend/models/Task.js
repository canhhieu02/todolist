import mongoose from "mongoose";

const subTaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  isCompleted: { type: Boolean, default: false }
});

const recurrenceSchema = new mongoose.Schema({
  type: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
  interval: { type: Number, default: 1, min: 1 }, // mỗi N ngày/tuần/tháng
  endDate: { type: Date, default: null },
  nextDueDate: { type: Date, default: null },
}, { _id: false });

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
    description: {
      type: String,
      default: "",
      maxlength: 5000,
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
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    recurrence: {
      type: recurrenceSchema,
      default: null,
    },
    // Task được chia sẻ với người dùng khác
    sharedWith: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true,
  }
);

// Text index để full-text search
taskSchema.index({ title: "text", description: "text", tags: "text" });

const Task = mongoose.model("Task", taskSchema);
export default Task;