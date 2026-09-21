import React, { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AddTask = ({ handleNewTaskAdded }) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newTaskData) => {
      return api.post("/tasks", newTaskData);
    },
    onSuccess: (_, variables) => {
      toast.success(`Nhiệm vụ "${variables.title}" đã được thêm.`);
      handleNewTaskAdded(); // Keep this if we still want it, or just queryClient.invalidateQueries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Reset
      setNewTaskTitle("");
      setPriority("medium");
      setDueDate("");
      setTagsInput("");
      setShowAdvanced(false);
    },
    onError: (error) => {
      console.error("Lỗi xảy ra khi thêm task.", error);
      toast.error("Lỗi xảy ra khi thêm nhiệm vụ mới.");
    },
  });

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter((t) => t);
      mutation.mutate({
        title: newTaskTitle,
        priority,
        dueDate: dueDate || null,
        tags,
      });
    } else {
      toast.error("Bạn cần nhập nội dung của nhiệm vụ.");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  };

  return (
    <Card className="p-5 sm:p-6 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-custom-md rounded-[1.5rem] transition-all duration-300">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="text"
            placeholder="Cần phải làm gì?"
            className="h-12 sm:h-14 text-base bg-white/60 dark:bg-black/20 backdrop-blur-sm sm:flex-1 border-white/80 dark:border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-2xl transition-all"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-12 sm:h-14 px-3 text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10 rounded-2xl transition-all"
            title="Tuỳ chọn nâng cao"
          >
            {showAdvanced ? <ChevronUp /> : <ChevronDown />}
          </Button>
          <Button
            variant="gradient"
            size="xl"
            className="px-6 sm:px-8 h-12 sm:h-14 rounded-2xl font-bold shadow-md hover:shadow-glow transition-all"
            onClick={addTask}
            disabled={!newTaskTitle.trim() || mutation.isPending}
          >
            <Plus className="size-5 mr-1" />
            Thêm
          </Button>
        </div>

        {showAdvanced && (
          <div className="flex flex-col gap-4 sm:flex-row p-4 sm:p-5 mt-2 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl animate-fade-in border border-white/60 dark:border-white/10 shadow-sm">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-white/80 dark:border-white/10 bg-white/60 dark:bg-black/20 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Ngày hết hạn</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 bg-white/60 dark:bg-black/20 backdrop-blur-sm border-white/80 dark:border-white/10 rounded-xl transition-all focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nhãn (cách nhau bởi dấu phẩy)</label>
              <Input
                type="text"
                placeholder="VD: học tập, công việc..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="h-10 bg-white/60 dark:bg-black/20 backdrop-blur-sm border-white/80 dark:border-white/10 rounded-xl transition-all focus:border-primary/50 focus:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AddTask;
