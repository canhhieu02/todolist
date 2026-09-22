import React, { useState, useRef } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Calendar, CheckCircle2, Circle, SquarePen, Trash2, GripVertical, Clock, Flag, Tag, X, Plus, MessageSquare } from "lucide-react";
import { Input } from "./ui/input";
import { format, isPast } from "date-fns";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TaskCollaborationDialog from "./TaskCollaborationDialog";
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

const TaskCard = ({ task, handleTaskChanged, dragHandleProps }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updateTaskTitle, setUpdateTaskTitle] = useState(task.title || "");
  const [newSubTask, setNewSubTask] = useState("");
  const [showCollabDialog, setShowCollabDialog] = useState(false);

  // ── ref để tránh double-save khi Enter + blur xảy ra cùng lúc ─────────────
  const isSavingRef = useRef(false);

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Nhiệm vụ đã xoá.");
      handleTaskChanged();
    } catch (error) {
      console.error("Lỗi xảy ra khi xoá task.", error);
      toast.error("Lỗi xảy ra khi xoá nhiệm vụ.");
    }
  };

  // ── Inline Edit: Sửa race condition blur + Enter ─────────────────────────────
  // - Blur → SAVE (không cancel như trước)
  // - Escape → CANCEL
  // - Enter → SAVE
  // isSavingRef ngăn double-save khi Enter gây blur trước khi unmount

  const updateTask = async () => {
    // Ngăn double-save khi Enter + blur cùng trigger
    if (isSavingRef.current) return;

    const trimmed = updateTaskTitle.trim();

    // Không có gì để save (tiêu đề rỗng)
    if (!trimmed) {
      cancelEdit();
      return;
    }

    // Không có thay đổi → chỉ đóng edit mode
    if (trimmed === task.title) {
      setIsEditing(false);
      return;
    }

    isSavingRef.current = true;
    setIsEditing(false);

    try {
      await api.put(`/tasks/${task._id}`, { title: trimmed });
      toast.success(`Đã đổi tên thành "${trimmed}"`);
      handleTaskChanged();
    } catch (error) {
      console.error("Lỗi xảy ra khi update task.", error);
      toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
      // Revert về title cũ nếu API lỗi
      setUpdateTaskTitle(task.title || "");
    } finally {
      isSavingRef.current = false;
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setUpdateTaskTitle(task.title || "");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      updateTask();
    } else if (event.key === "Escape") {
      cancelEdit();
    }
  };

  // Blur → Save (không cancel). isSavingRef ngăn double-save với Enter
  const handleBlur = () => {
    updateTask();
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
      toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
    }
  };

  // ── SubTask APIs — dùng atomic endpoints, không ghi đè toàn bộ array ─────────

  const addSubTask = async () => {
    if (!newSubTask.trim()) return;
    try {
      // POST /tasks/:id/subtasks — server dùng $push
      await api.post(`/tasks/${task._id}/subtasks`, { title: newSubTask });
      setNewSubTask("");
      handleTaskChanged();
    } catch {
      toast.error("Lỗi khi thêm nhiệm vụ con");
    }
  };

  const toggleSubTask = async (subTaskId) => {
    try {
      // PATCH /tasks/:id/subtasks/:subId/toggle — server dùng $set positional
      await api.patch(`/tasks/${task._id}/subtasks/${subTaskId}/toggle`);
      handleTaskChanged();
    } catch {
      toast.error("Lỗi cập nhật nhiệm vụ con");
    }
  };

  const removeSubTask = async (subTaskId) => {
    try {
      // DELETE /tasks/:id/subtasks/:subId — server dùng $pull
      await api.delete(`/tasks/${task._id}/subtasks/${subTaskId}`);
      handleTaskChanged();
      toast.success("Đã xóa nhiệm vụ con");
    } catch {
      toast.error("Lỗi xóa nhiệm vụ con");
    }
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "complete";

  return (
    <Card
      className={cn(
        "relative p-5 bg-gradient-card backdrop-blur-md border border-white/80 dark:border-white/5 rounded-2xl shadow-custom-sm hover:shadow-custom-md transition-all duration-300 group hover:-translate-y-0.5",
        task.status === "complete" && "opacity-70 grayscale-[30%]"
      )}
    >
      {task.createdAt && (
        <span className="absolute top-3 right-4 text-[10px] text-muted-foreground/60 pointer-events-none">
          Ngày thêm: {format(new Date(task.createdAt), "dd/MM/yyyy")}
        </span>
      )}
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
                {isOverdue && " (Quá hạn)"}
              </span>
            )}
          </div>

          {/* Title — edit mode hoặc display mode */}
          {isEditing ? (
            <Input
              placeholder="Cần phải làm gì?"
              className="flex-1 h-10 mb-2 text-base border-primary/20 bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:border-primary focus:ring-primary/30 rounded-xl transition-all"
              type="text"
              value={updateTaskTitle}
              onChange={(e) => setUpdateTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              autoFocus
            />
          ) : (
            <>
              <p
                className={cn(
                  "text-base transition-all duration-200 mb-1",
                  task.status === "complete"
                    ? "line-through text-muted-foreground"
                    : "text-foreground font-medium"
                )}
              >
                {task.title}
              </p>
              
              {/* Mô tả chi tiết */}
              {task.description && (
                <div className={cn(
                  "prose prose-sm dark:prose-invert max-w-none text-sm text-foreground/80 markdown-body bg-black/5 dark:bg-white/5 p-3 rounded-xl mb-3 border border-border/50",
                  task.status === "complete" && "opacity-60"
                )}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {task.description}
                  </ReactMarkdown>
                </div>
              )}
            </>
          )}

          {/* Sub-tasks */}
          <div className="space-y-2 mt-3 ml-2 border-l-2 border-muted pl-4">
            {task.subTasks?.map((sub) => (
              <div key={sub._id} className="flex items-center gap-2 group/sub">
                {/* Toggle checkbox — dùng sub._id, không phải index */}
                <button
                  onClick={() => toggleSubTask(sub._id)}
                  className={cn(
                    "flex-shrink-0 size-4 rounded transition-colors border flex items-center justify-center",
                    sub.isCompleted ? "bg-success border-success text-white" : "border-muted-foreground hover:border-primary"
                  )}
                >
                  {sub.isCompleted && <CheckCircle2 className="size-3" />}
                </button>
                <span className={cn("text-sm flex-1", sub.isCompleted ? "line-through text-muted-foreground" : "text-foreground")}>
                  {sub.title}
                </span>
                {/* Nút xóa subtask — hiện khi hover */}
                <button
                  onClick={() => removeSubTask(sub._id)}
                  className="opacity-0 group-hover/sub:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  title="Xóa nhiệm vụ con"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}

            {/* Thêm Sub-task mới */}
            <div className="flex items-center gap-2 mt-2">
              <Input 
                value={newSubTask}
                onChange={(e) => setNewSubTask(e.target.value)}
                placeholder="Thêm nhiệm vụ con..."
                className="h-8 text-sm bg-white/40 dark:bg-black/20 backdrop-blur-sm border-white/60 dark:border-white/10 focus:border-primary/50 rounded-lg w-full max-w-[250px] transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubTask();
                  }
                }}
              />
              {newSubTask.trim() && (
                <button
                  onClick={addSubTask}
                  className="text-primary hover:text-primary/80 transition-colors"
                  title="Thêm"
                >
                  <Plus className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Nút chỉnh và xoá */}
        <div className="inline-flex gap-2 self-end opacity-70 hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 transition-colors size-8 text-muted-foreground hover:text-primary"
            onClick={() => setShowCollabDialog(true)}
            title="Thảo luận & Chia sẻ"
          >
            <MessageSquare className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 transition-colors size-8 text-muted-foreground hover:text-info"
            onClick={() => {
              setIsEditing(true);
              setUpdateTaskTitle(task.title || "");
            }}
            title={isEditing ? "Đang chỉnh sửa... (Enter để lưu, Escape để hủy)" : "Chỉnh sửa tiêu đề"}
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

      <TaskCollaborationDialog 
        open={showCollabDialog} 
        onOpenChange={setShowCollabDialog} 
        task={task} 
      />
    </Card>
  );
};

export default TaskCard;
