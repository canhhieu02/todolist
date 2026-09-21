import React, { useState } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Calendar, CheckCircle2, Circle, SquarePen, Trash2, GripVertical, Clock, Flag, Tag } from "lucide-react";
import { Input } from "./ui/input";
import { format, isPast } from "date-fns";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import api from "@/lib/axios";
import { toast } from "sonner";

const priorityColors = {
  high: "text-destructive bg-destructive/10 border-destructive/20",
  medium: "text-warning bg-warning/10 border-warning/20",
  low: "text-success bg-success/10 border-success/20"
};

const priorityLabels = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp"
};

const TaskCard = ({ task, index, handleTaskChanged, dragHandleProps }) => {
  const [isEditting, setIsEditting] = useState(false);
  const [updateTaskTitle, setUpdateTaskTitle] = useState(task.title || "");
  const [newSubTask, setNewSubTask] = useState("");

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Nhiệm vụ đã xoá.");
      handleTaskChanged();
    } catch (error) {
      console.error("Lỗi xảy ra khi xoá task.", error);
      toast.error("Lỗi xảy ra khi xoá nhiệm vụ mới.");
    }
  };

  const updateTask = async () => {
    try {
      setIsEditting(false);
      await api.put(`/tasks/${task._id}`, {
        title: updateTaskTitle,
      });
      toast.success(`Nhiệm vụ đã đổi thành ${updateTaskTitle}`);
      handleTaskChanged();
    } catch (error) {
      console.error("Lỗi xảy ra khi update task.", error);
      toast.error("Lỗi xảy ra khi cập nhập nhiệm vụ.");
    }
  };

  const toggleTaskCompleteButton = async () => {
    try {
      if (task.status === "active") {
        await api.put(`/tasks/${task._id}`, {
          status: "complete",
          completedAt: new Date().toISOString(),
        });

        toast.success(`${task.title} đã hoàn thành.`);
      } else {
        await api.put(`/tasks/${task._id}`, {
          status: "active",
          completedAt: null,
        });
        toast.success(`${task.title} đã đổi sang chưa hoàn thành.`);
      }

      handleTaskChanged();
    } catch (error) {
      console.error("Lỗi xảy ra khi update task.", error);
      toast.error("Lỗi xảy ra khi cập nhập nhiệm vụ.");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      updateTask();
    }
  };

  const addSubTask = async () => {
    if (!newSubTask.trim()) return;
    try {
      const updatedSubTasks = [...(task.subTasks || []), { title: newSubTask, isCompleted: false }];
      await api.put(`/tasks/${task._id}`, { subTasks: updatedSubTasks });
      setNewSubTask("");
      handleTaskChanged();
    } catch (error) {
      toast.error("Lỗi khi thêm nhiệm vụ con");
    }
  };

  const toggleSubTask = async (subTaskIndex) => {
    try {
      const updatedSubTasks = [...task.subTasks];
      updatedSubTasks[subTaskIndex].isCompleted = !updatedSubTasks[subTaskIndex].isCompleted;
      await api.put(`/tasks/${task._id}`, { subTasks: updatedSubTasks });
      handleTaskChanged();
    } catch (error) {
      toast.error("Lỗi cập nhật nhiệm vụ con");
    }
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "complete";

  return (
    <Card
      className={cn(
        "p-4 bg-gradient-card border-0 shadow-custom-md hover:shadow-custom-lg transition-all duration-200 group",
        task.status === "complete" && "opacity-75"
      )}
    >
      <div className="flex gap-4">
        {/* Nút Drag Handle (Kéo thả) */}
        <div 
          {...dragHandleProps} 
          className="flex items-center text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="size-5" />
        </div>

        {/* Nút tròn Hoàn thành */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "flex-shrink-0 size-8 rounded-full transition-all duration-200",
            task.status === "complete"
              ? "text-success hover:text-success/80"
              : "text-muted-foreground hover:text-primary"
          )}
          onClick={toggleTaskCompleteButton}
        >
          {task.status === "complete" ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <Circle className="size-5" />
          )}
        </Button>

        {/* Nội dung chính */}
        <div className="flex-1 min-w-0">
          {/* Tags & Priority */}
          <div className="flex flex-wrap gap-2 mb-2">
            {task.priority && (
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border", priorityColors[task.priority] || priorityColors.medium)}>
                <Flag className="size-3" />
                {priorityLabels[task.priority] || "Trung bình"}
              </span>
            )}
            {task.tags?.map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <Tag className="size-3" />
                {tag}
              </span>
            ))}
            {task.dueDate && (
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border", isOverdue ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted text-muted-foreground")}>
                <Clock className="size-3" />
                {format(new Date(task.dueDate), "dd/MM/yyyy")}
              </span>
            )}
          </div>

          {isEditting ? (
            <Input
              placeholder="Cần phải làm gì?"
              className="flex-1 h-10 mb-2 text-base border-border/50 focus:border-primary/50 focus:ring-primary/20"
              type="text"
              value={updateTaskTitle}
              onChange={(e) => setUpdateTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setIsEditting(false);
                setUpdateTaskTitle(task.title || "");
              }}
            />
          ) : (
            <p
              className={cn(
                "text-base transition-all duration-200 mb-2",
                task.status === "complete"
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {task.title}
            </p>
          )}

          {/* Sub-tasks */}
          <div className="space-y-2 mt-3 ml-2 border-l-2 border-muted pl-4">
            {task.subTasks?.map((sub, i) => (
              <div key={i} className="flex items-center gap-2 group/sub">
                <button 
                  onClick={() => toggleSubTask(i)}
                  className={cn("flex-shrink-0 size-4 rounded transition-colors border", sub.isCompleted ? "bg-success border-success text-white" : "border-muted-foreground hover:border-primary")}
                >
                  {sub.isCompleted && <CheckCircle2 className="size-3" />}
                </button>
                <span className={cn("text-sm", sub.isCompleted ? "line-through text-muted-foreground" : "text-foreground")}>
                  {sub.title}
                </span>
              </div>
            ))}
            {/* Thêm Sub-task mới */}
            <div className="flex items-center gap-2 mt-2">
              <Input 
                value={newSubTask}
                onChange={(e) => setNewSubTask(e.target.value)}
                placeholder="Thêm nhiệm vụ con..."
                className="h-7 text-xs bg-white/50 w-full max-w-[200px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSubTask();
                }}
              />
            </div>
          </div>
        </div>

        {/* Nút chỉnh và xoá */}
        <div className="hidden gap-2 group-hover:inline-flex animate-slide-up self-start">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 transition-colors size-8 text-muted-foreground hover:text-info"
            onClick={() => {
              setIsEditting(true);
              setUpdateTaskTitle(task.title || "");
            }}
          >
            <SquarePen className="size-4" />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 transition-colors size-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận xoá</DialogTitle>
                <DialogDescription>
                  Bạn có chắc muốn xoá nhiệm vụ "{task.title}"?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Huỷ</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={() => deleteTask(task._id)}>
                    Xoá
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
